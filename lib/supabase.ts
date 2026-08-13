import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { AppState, Platform } from "react-native";

import type { Database } from "./database.types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Fail loudly at startup rather than shipping an app that silently cannot reach
// its backend. The previous Appwrite client fell back to empty strings, which
// turned a misconfigured build into a mystery instead of an error.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. EXPO_PUBLIC_SUPABASE_URL and " +
      "EXPO_PUBLIC_SUPABASE_ANON_KEY must be set at build time — see SUPABASE_SETUP.md.",
  );
}

/**
 * SecureStore refuses values larger than 2048 bytes, and a Supabase session
 * (access token + refresh token + user payload) regularly exceeds that once a
 * user has metadata. This adapter transparently splits large values across
 * numbered chunk keys.
 *
 * Layout for a chunked value:
 *   <key>       -> "__chunks__:<n>"
 *   <key>.0..n  -> the slices
 *
 * Small values are written directly to <key>, so the common case costs nothing.
 */
const CHUNK_PREFIX = "__chunks__:";
const CHUNK_SIZE = 1800;

async function clearChunks(key: string, count: number) {
  const deletions: Promise<void>[] = [];
  for (let i = 0; i < count; i += 1) {
    deletions.push(SecureStore.deleteItemAsync(`${key}.${i}`));
  }
  await Promise.all(deletions);
}

const secureStoreAdapter: SupportedStorage = {
  async getItem(key) {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;
    if (!head.startsWith(CHUNK_PREFIX)) return head;

    const count = Number.parseInt(head.slice(CHUNK_PREFIX.length), 10);
    if (!Number.isFinite(count) || count <= 0) return null;

    const slices = await Promise.all(
      Array.from({ length: count }, (_, i) =>
        SecureStore.getItemAsync(`${key}.${i}`),
      ),
    );

    // A missing slice means the write was interrupted — treat the whole value
    // as absent so the caller re-authenticates instead of parsing garbage.
    if (slices.some((slice) => slice === null)) return null;
    return slices.join("");
  },

  async setItem(key, value) {
    // Always clear any previous chunks first, otherwise shrinking a value
    // leaves orphaned slices behind that a later read could pick up.
    const previous = await SecureStore.getItemAsync(key);
    if (previous?.startsWith(CHUNK_PREFIX)) {
      const previousCount = Number.parseInt(
        previous.slice(CHUNK_PREFIX.length),
        10,
      );
      if (Number.isFinite(previousCount)) {
        await clearChunks(key, previousCount);
      }
    }

    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let i = 0; i < count; i += 1) {
      await SecureStore.setItemAsync(
        `${key}.${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${count}`);
  },

  async removeItem(key) {
    const head = await SecureStore.getItemAsync(key);
    if (head?.startsWith(CHUNK_PREFIX)) {
      const count = Number.parseInt(head.slice(CHUNK_PREFIX.length), 10);
      if (Number.isFinite(count)) {
        await clearChunks(key, count);
      }
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// SecureStore has no web implementation; fall back to AsyncStorage there.
const storage = Platform.OS === "web" ? AsyncStorage : secureStoreAdapter;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native has no URL bar for Supabase to parse a session out of.
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

// Supabase refreshes tokens on a timer, which the OS suspends in the
// background. Stop the timer when backgrounded and restart on foreground so a
// returning user does not land on a stale token.
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/** Local storage keys the app owns, cleared on sign-out. */
export const LOCAL_KEYS = {
  courseProgress: (userId: string) => `course_progress:${userId}`,
  chatSessions: (userId: string) => `chat_sessions:${userId}`,
  aiPopupSeen: (userId: string) => `has_seen_ai_popup:${userId}`,
  redditCache: (subreddit: string) => `reddit_posts:${subreddit}`,
} as const;

/**
 * Remove every app-owned local key for a user. Called on sign-out so the next
 * account to sign in on this device cannot read the previous one's cached
 * conversations or course progress.
 */
export async function clearLocalUserData(userId: string) {
  const keys = await AsyncStorage.getAllKeys();
  const owned = keys.filter(
    (key) =>
      key.endsWith(`:${userId}`) ||
      key.startsWith("reddit_posts:") ||
      // Legacy un-namespaced keys from the Appwrite build.
      key === "course_progress" ||
      key === "chatSessions" ||
      key === "hasSeenAIPopup" ||
      key === "user",
  );
  if (owned.length > 0) {
    await AsyncStorage.multiRemove(owned);
  }
}

import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { clearLocalUserData, supabase } from "@/lib/supabase";
import { profileService } from "@/lib/db";

WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
}

export type AuthResult = { ok: true } | { ok: false; message: string };

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithApple: () => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthResult>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(user: SupabaseUser | null | undefined): AuthUser | null {
  if (!user) return null;
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    name:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      user.email?.split("@")[0] ??
      null,
  };
}

/** Turn a Supabase auth error into something worth showing a person. */
function describeAuthError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Something went wrong.";

  if (/invalid login credentials/i.test(raw)) {
    return "That email and password don't match. Check them and try again.";
  }
  if (/user already registered/i.test(raw)) {
    return "An account already exists for that email. Try signing in instead.";
  }
  if (/password should be at least/i.test(raw)) {
    return "Passwords need to be at least 6 characters.";
  }
  if (/email not confirmed/i.test(raw)) {
    return "Confirm your email address first — check your inbox for the link.";
  }
  if (/network|fetch/i.test(raw)) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return raw;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        lastUserIdRef.current = data.session?.user.id ?? null;
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        lastUserIdRef.current = nextSession?.user.id ?? null;
        setIsLoading(false);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    try {
      if (!(await AppleAuthentication.isAvailableAsync())) {
        return {
          ok: false,
          message: "Sign in with Apple isn't available on this device.",
        };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { ok: false, message: "Apple didn't return an identity token." };
      }

      // Supabase verifies this token against Apple's public keys server-side.
      // No password is synthesised and nothing about the account is derivable
      // from a value the client controls.
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) return { ok: false, message: describeAuthError(error) };

      // Apple only ever sends the display name on the very first authorization,
      // so capture it now or lose it permanently.
      const givenName = credential.fullName?.givenName ?? "";
      const familyName = credential.fullName?.familyName ?? "";
      const fullName = `${givenName} ${familyName}`.trim();

      if (fullName && data.user) {
        await supabase.auth.updateUser({ data: { full_name: fullName } });
        await profileService
          .update(data.user.id, { display_name: fullName })
          .catch(() => {
            // A missing display name is not worth failing a sign-in over.
          });
      }

      return { ok: true };
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "ERR_REQUEST_CANCELED"
      ) {
        return { ok: false, message: "" };
      }
      return { ok: false, message: describeAuthError(error) };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      const redirectTo = makeRedirectUri({ scheme: "faded", path: "auth" });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { ok: false, message: describeAuthError(error) };
      if (!data.url) {
        return { ok: false, message: "Couldn't start Google sign-in." };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success") {
        return { ok: false, message: "" };
      }

      return await createSessionFromUrl(result.url);
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error
        ? { ok: false, message: describeAuthError(error) }
        : { ok: true };
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (
      name: string,
      email: string,
      password: string,
    ): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (error) return { ok: false, message: describeAuthError(error) };

      // With email confirmation enabled there is no session yet — say so
      // rather than silently landing the user back on the sign-in screen.
      if (!data.session) {
        return {
          ok: false,
          message: "Check your inbox to confirm your email, then sign in.",
        };
      }

      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const userId = lastUserIdRef.current;
    try {
      await supabase.auth.signOut();
    } finally {
      // Always clear local caches, even if the network call failed — otherwise
      // the next account to sign in on this device inherits the previous one's
      // conversations and course progress.
      if (userId) await clearLocalUserData(userId);
      setSession(null);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    const userId = lastUserIdRef.current;
    try {
      await profileService.deleteAccount();
      if (userId) await clearLocalUserData(userId);
      await supabase.auth.signOut();
      setSession(null);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: describeAuthError(error) };
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: toAuthUser(session?.user),
      session,
      isLoading,
      isAuthenticated: !!session?.user,
      signInWithApple,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      deleteAccount,
    }),
    [
      session,
      isLoading,
      signInWithApple,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Complete an OAuth redirect. Handles both the PKCE flow (a `code` query param,
 * which is what this client is configured for) and the implicit flow (tokens in
 * the URL fragment) so a provider misconfiguration degrades gracefully.
 */
export async function createSessionFromUrl(url: string): Promise<AuthResult> {
  const parsed = new URL(url);
  const query = parsed.searchParams;
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ""));

  const errorDescription =
    query.get("error_description") ?? fragment.get("error_description");
  if (errorDescription) return { ok: false, message: errorDescription };

  const code = query.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? { ok: false, message: error.message } : { ok: true };
  }

  const accessToken = fragment.get("access_token") ?? query.get("access_token");
  const refreshToken =
    fragment.get("refresh_token") ?? query.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return error ? { ok: false, message: error.message } : { ok: true };
  }

  return { ok: false, message: "Sign-in didn't return a session." };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

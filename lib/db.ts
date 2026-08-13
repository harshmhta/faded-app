/**
 * Data access for Faded.
 *
 * Two deliberate differences from the Appwrite layer this replaces:
 *
 *   1. Errors throw. The old services caught everything and returned `null` or
 *      `[]`, so a dropped connection rendered as an empty state that looked
 *      like data loss. Callers now decide how to surface a failure.
 *
 *   2. Daily records upsert on the (user_id, entry_date) unique constraint
 *      instead of doing a read-then-write, which raced against itself on a
 *      double tap and produced a 409.
 */

import { supabase } from "./supabase";
import { toEntryDate } from "./dates";
import type {
  ChatMessageRow,
  ChatSessionRow,
  ConsumptionLog,
  ConsumptionStatusValue,
  CourseProgressRow,
  MoodCheckIn,
  Profile,
} from "./database.types";

function unwrap<T>(result: { data: T | null; error: unknown }, context: string): T {
  if (result.error) {
    const message =
      result.error instanceof Error
        ? result.error.message
        : typeof result.error === "object" &&
            result.error !== null &&
            "message" in result.error
          ? String((result.error as { message: unknown }).message)
          : String(result.error);
    throw new Error(`${context}: ${message}`);
  }
  if (result.data === null) {
    throw new Error(`${context}: no data returned`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Profile — quit date, spend, onboarding state
// ---------------------------------------------------------------------------

export const profileService = {
  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to load profile: ${error.message}`);
    return data;
  },

  async update(
    userId: string,
    patch: {
      display_name?: string | null;
      quit_date?: string | null;
      daily_spend?: number;
      currency?: string;
      onboarded_at?: string | null;
    },
  ): Promise<Profile> {
    const result = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();

    return unwrap(result, "Failed to update profile");
  },

  /** Complete onboarding: record the real quit date and spending baseline. */
  async completeOnboarding(
    userId: string,
    input: { quitDate: Date; dailySpend: number; currency?: string },
  ): Promise<Profile> {
    return this.update(userId, {
      quit_date: input.quitDate.toISOString(),
      daily_spend: input.dailySpend,
      currency: input.currency ?? "USD",
      onboarded_at: new Date().toISOString(),
    });
  },

  /**
   * Move the quit date and record why. Used both for "I relapsed" and for a
   * plain correction of a mis-entered date.
   */
  async resetQuitDate(
    userId: string,
    newQuitDate: Date,
    reason?: string,
  ): Promise<Profile> {
    const current = await this.get(userId);

    const { error: historyError } = await supabase
      .from("sobriety_resets")
      .insert({
        user_id: userId,
        previous_quit_date: current?.quit_date ?? null,
        new_quit_date: newQuitDate.toISOString(),
        reason: reason ?? null,
      });

    if (historyError) {
      throw new Error(`Failed to record reset: ${historyError.message}`);
    }

    return this.update(userId, { quit_date: newQuitDate.toISOString() });
  },

  async deleteAccount(): Promise<void> {
    const { error } = await supabase.rpc("delete_own_account");
    if (error) throw new Error(`Failed to delete account: ${error.message}`);
  },
};

// ---------------------------------------------------------------------------
// Mood check-ins
// ---------------------------------------------------------------------------

export const moodService = {
  async save(
    userId: string,
    mood: string,
    comment?: string,
    date?: Date,
  ): Promise<MoodCheckIn> {
    const result = await supabase
      .from("mood_check_ins")
      .upsert(
        {
          user_id: userId,
          entry_date: toEntryDate(date),
          mood,
          comment: comment ?? null,
        },
        { onConflict: "user_id,entry_date" },
      )
      .select()
      .single();

    return unwrap(result, "Failed to save check-in");
  },

  async getByDate(userId: string, date: Date): Promise<MoodCheckIn | null> {
    const { data, error } = await supabase
      .from("mood_check_ins")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_date", toEntryDate(date))
      .maybeSingle();

    if (error) throw new Error(`Failed to load check-in: ${error.message}`);
    return data;
  },

  async getRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<MoodCheckIn[]> {
    const { data, error } = await supabase
      .from("mood_check_ins")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", startDate)
      .lte("entry_date", endDate)
      .order("entry_date", { ascending: false });

    if (error) throw new Error(`Failed to load check-ins: ${error.message}`);
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Consumption logs
// ---------------------------------------------------------------------------

export const consumptionService = {
  async save(
    userId: string,
    status: ConsumptionStatusValue,
    comment?: string,
    date?: Date,
  ): Promise<ConsumptionLog> {
    const result = await supabase
      .from("consumption_logs")
      .upsert(
        {
          user_id: userId,
          entry_date: toEntryDate(date),
          status,
          comment: comment ?? null,
        },
        { onConflict: "user_id,entry_date" },
      )
      .select()
      .single();

    return unwrap(result, "Failed to save log");
  },

  async getByDate(userId: string, date: Date): Promise<ConsumptionLog | null> {
    const { data, error } = await supabase
      .from("consumption_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_date", toEntryDate(date))
      .maybeSingle();

    if (error) throw new Error(`Failed to load log: ${error.message}`);
    return data;
  },

  async getRange(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ConsumptionLog[]> {
    const { data, error } = await supabase
      .from("consumption_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", startDate)
      .lte("entry_date", endDate)
      .order("entry_date", { ascending: false });

    if (error) throw new Error(`Failed to load logs: ${error.message}`);
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Course progress — now server-backed so it survives a reinstall
// ---------------------------------------------------------------------------

export const courseProgressService = {
  async get(userId: string): Promise<CourseProgressRow | null> {
    const { data, error } = await supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to load progress: ${error.message}`);
    return data;
  },

  /**
   * The signup trigger creates this row, but a user created before the trigger
   * existed (or restored from a backup) may not have one.
   */
  async ensure(userId: string): Promise<CourseProgressRow> {
    const existing = await this.get(userId);
    if (existing) return existing;

    const result = await supabase
      .from("course_progress")
      .upsert({ user_id: userId }, { onConflict: "user_id" })
      .select()
      .single();

    return unwrap(result, "Failed to create progress");
  },

  async update(
    userId: string,
    patch: Partial<
      Pick<
        CourseProgressRow,
        | "current_chapter"
        | "current_section"
        | "completed_sections"
        | "completed_chapters"
        | "quiz_scores"
        | "total_xp"
        | "streak_days"
        | "last_streak_date"
      >
    >,
  ): Promise<CourseProgressRow> {
    const result = await supabase
      .from("course_progress")
      .update({ ...patch, last_accessed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();

    return unwrap(result, "Failed to save progress");
  },
};

// ---------------------------------------------------------------------------
// Chat — sessions and messages live server-side so history follows the account
// ---------------------------------------------------------------------------

export const chatService = {
  async listSessions(userId: string, limit = 50): Promise<ChatSessionRow[]> {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to load conversations: ${error.message}`);
    return data ?? [];
  },

  async getMessages(sessionId: string): Promise<ChatMessageRow[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load messages: ${error.message}`);
    return data ?? [];
  },

  async createSession(userId: string, title?: string): Promise<ChatSessionRow> {
    const result = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title: title ?? null })
      .select()
      .single();

    return unwrap(result, "Failed to start conversation");
  },

  async renameSession(sessionId: string, title: string): Promise<void> {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title })
      .eq("id", sessionId);

    if (error) throw new Error(`Failed to rename conversation: ${error.message}`);
  },

  async deleteSession(sessionId: string): Promise<void> {
    // chat_messages cascades from chat_sessions.
    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw new Error(`Failed to delete conversation: ${error.message}`);
  },
};

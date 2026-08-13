/**
 * Types for the Faded Supabase schema.
 *
 * Hand-written to match supabase/migrations/20260813000000_init.sql. Once your
 * project is live you can regenerate this file instead of maintaining it:
 *
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          quit_date: string | null;
          daily_spend: number;
          currency: string;
          onboarded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          quit_date?: string | null;
          daily_spend?: number;
          currency?: string;
          onboarded_at?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          quit_date?: string | null;
          daily_spend?: number;
          currency?: string;
          onboarded_at?: string | null;
        };
        Relationships: [];
      };

      sobriety_resets: {
        Row: {
          id: string;
          user_id: string;
          previous_quit_date: string | null;
          new_quit_date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          previous_quit_date?: string | null;
          new_quit_date: string;
          reason?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      mood_check_ins: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          mood: string;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entry_date: string;
          mood: string;
          comment?: string | null;
        };
        Update: {
          mood?: string;
          comment?: string | null;
        };
        Relationships: [];
      };

      consumption_logs: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          status: ConsumptionStatusValue;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entry_date: string;
          status: ConsumptionStatusValue;
          comment?: string | null;
        };
        Update: {
          status?: ConsumptionStatusValue;
          comment?: string | null;
        };
        Relationships: [];
      };

      course_progress: {
        Row: {
          user_id: string;
          current_chapter: number;
          current_section: number;
          completed_sections: string[];
          completed_chapters: string[];
          quiz_scores: Record<string, number>;
          total_xp: number;
          streak_days: number;
          last_streak_date: string | null;
          last_accessed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_chapter?: number;
          current_section?: number;
          completed_sections?: string[];
          completed_chapters?: string[];
          quiz_scores?: Record<string, number>;
          total_xp?: number;
          streak_days?: number;
          last_streak_date?: string | null;
          last_accessed_at?: string;
        };
        Update: {
          current_chapter?: number;
          current_section?: number;
          completed_sections?: string[];
          completed_chapters?: string[];
          quiz_scores?: Record<string, number>;
          total_xp?: number;
          streak_days?: number;
          last_streak_date?: string | null;
          last_accessed_at?: string;
        };
        Relationships: [];
      };

      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
        };
        Update: {
          title?: string | null;
        };
        Relationships: [];
      };

      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: ChatRole;
          content: string;
          created_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          role: ChatRole;
          content: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      delete_own_account: {
        Args: Record<string, never>;
        Returns: void;
      };
    };

    Enums: Record<string, never>;

    CompositeTypes: Record<string, never>;
  };
}

/** Matches the check constraint on consumption_logs.status. */
export type ConsumptionStatusValue = "clean" | "smoked";

/** Gemini uses "model" rather than "assistant" for its own turns. */
export type ChatRole = "user" | "model";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MoodCheckIn = Database["public"]["Tables"]["mood_check_ins"]["Row"];
export type ConsumptionLog =
  Database["public"]["Tables"]["consumption_logs"]["Row"];
export type CourseProgressRow =
  Database["public"]["Tables"]["course_progress"]["Row"];
export type ChatSessionRow =
  Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessageRow =
  Database["public"]["Tables"]["chat_messages"]["Row"];

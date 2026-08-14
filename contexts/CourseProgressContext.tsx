import AsyncStorage from "@react-native-async-storage/async-storage";
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

import { useAuth } from "@/contexts/AuthContext";
import { courseProgressService } from "@/lib/db";
import { toEntryDate } from "@/lib/dates";
import { LOCAL_KEYS } from "@/lib/supabase";
import type { CourseProgressRow } from "@/lib/database.types";
import { CourseProgress } from "@/types/course";

/**
 * Course progress is server-backed so it survives a reinstall or a device
 * switch — previously it lived only in AsyncStorage under a global key, so the
 * sobriety timer persisted while the entire course journey did not.
 *
 * A per-user local cache is still kept, but only to paint instantly on launch
 * and to keep the course usable offline. Supabase is the source of truth.
 */

interface CourseProgressContextType {
  progress: CourseProgress | null;
  loading: boolean;
  /** Set when a sync fails. Local progress is retained regardless. */
  error: string | null;
  updateProgress: (updates: Partial<CourseProgress>) => Promise<void>;
  completeSection: (
    chapterId: string,
    sectionId: string,
    xpEarned: number,
  ) => Promise<void>;
  completeChapter: (
    chapterId: string,
    quizScore: number,
    xpEarned: number,
  ) => Promise<void>;
  isChapterUnlocked: (chapterNumber: number) => boolean;
  isSectionCompleted: (chapterId: string, sectionId: string) => boolean;
  calculateStreak: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

const CourseProgressContext = createContext<
  CourseProgressContextType | undefined
>(undefined);

const initialProgress: CourseProgress = {
  currentChapter: 1,
  currentSection: 0,
  completedSections: [],
  completedChapters: [],
  quizScores: {},
  lastAccessedAt: new Date().toISOString(),
  totalXP: 0,
  streakDays: 0,
  lastStreakDate: null,
};

function rowToProgress(row: CourseProgressRow): CourseProgress {
  return {
    currentChapter: row.current_chapter,
    currentSection: row.current_section,
    completedSections: row.completed_sections ?? [],
    completedChapters: row.completed_chapters ?? [],
    quizScores: row.quiz_scores ?? {},
    lastAccessedAt: row.last_accessed_at,
    totalXP: row.total_xp,
    streakDays: row.streak_days,
    lastStreakDate: row.last_streak_date,
  };
}

/**
 * Pure streak update: same-day is a no-op, consecutive-day increments,
 * a gap resets to 1. Returns the input object unchanged when nothing moves,
 * so callers can cheaply detect "no write needed".
 */
function applyStreak(progress: CourseProgress): CourseProgress {
  const today = toEntryDate();

  if (!progress.lastStreakDate) {
    return { ...progress, streakDays: 1, lastStreakDate: today };
  }

  // Older rows may hold a full ISO timestamp; take the date portion.
  const last = progress.lastStreakDate.slice(0, 10);
  if (last === today) return progress;

  const yesterday = toEntryDate(new Date(Date.now() - 86_400_000));
  return {
    ...progress,
    streakDays: last === yesterday ? progress.streakDays + 1 : 1,
    lastStreakDate: today,
  };
}

function progressToPatch(progress: CourseProgress) {
  return {
    current_chapter: progress.currentChapter,
    current_section: progress.currentSection,
    completed_sections: progress.completedSections,
    completed_chapters: progress.completedChapters,
    quiz_scores: progress.quizScores,
    total_xp: progress.totalXP,
    streak_days: progress.streakDays,
    last_streak_date: progress.lastStreakDate,
  };
}

export function CourseProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  userIdRef.current = user?.id ?? null;

  const cacheKey = user ? LOCAL_KEYS.courseProgress(user.id) : null;

  /** Write local first (instant, offline-safe), then push to Supabase. */
  const persist = useCallback(
    async (next: CourseProgress) => {
      setProgress(next);

      if (cacheKey) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify(next)).catch(() => {
          // A cache write failure is not worth interrupting the lesson over.
        });
      }

      const userId = userIdRef.current;
      if (!userId) return;

      try {
        await courseProgressService.update(userId, progressToPatch(next));
        setError(null);
      } catch (err) {
        // Keep the local value — the user earned it. Surface the sync failure
        // without rolling their progress back.
        setError(
          err instanceof Error
            ? `Progress saved on this device but not synced: ${err.message}`
            : "Progress saved on this device but not synced.",
        );
      }
    },
    [cacheKey],
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!user || !cacheKey) {
        setProgress(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Paint from cache immediately so the course tab isn't blank on launch.
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && active) {
          setProgress(JSON.parse(cached) as CourseProgress);
        }
      } catch {
        // Corrupt cache is not fatal; the server copy follows.
      }

      try {
        const row = await courseProgressService.ensure(user.id);
        if (!active) return;

        // Roll the streak forward as part of the load. Previously this only
        // happened when the course tab called calculateStreak() on mount,
        // which no-oped whenever the tab rendered before the data arrived.
        const serverProgress = applyStreak(rowToProgress(row));
        setProgress(serverProgress);
        setError(null);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(serverProgress));

        if (serverProgress.lastStreakDate !== row.last_streak_date?.slice(0, 10)) {
          // Streak moved — push it so the server copy matches. A failure here
          // is recoverable (recomputed on next load), so don't surface it.
          await courseProgressService
            .update(user.id, {
              streak_days: serverProgress.streakDays,
              last_streak_date: serverProgress.lastStreakDate,
            })
            .catch(() => {});
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Couldn't sync course progress.",
        );
        // Fall back to the cache, or a fresh slate if there wasn't one.
        setProgress((current) => current ?? initialProgress);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user, cacheKey]);

  const updateProgress = useCallback(
    async (updates: Partial<CourseProgress>) => {
      if (!progress) return;
      await persist({
        ...progress,
        ...updates,
        lastAccessedAt: new Date().toISOString(),
      });
    },
    [progress, persist],
  );

  const completeSection = useCallback(
    async (chapterId: string, sectionId: string, xpEarned: number) => {
      if (!progress) return;

      const sectionKey = `${chapterId}-${sectionId}`;
      if (progress.completedSections.includes(sectionKey)) return;

      await persist({
        ...progress,
        completedSections: [...progress.completedSections, sectionKey],
        totalXP: progress.totalXP + xpEarned,
        lastAccessedAt: new Date().toISOString(),
      });
    },
    [progress, persist],
  );

  const completeChapter = useCallback(
    async (chapterId: string, quizScore: number, xpEarned: number) => {
      if (!progress) return;

      const chapterNumber = Number.parseInt(chapterId.split("-")[1], 10);
      const alreadyComplete = progress.completedChapters.includes(chapterId);

      await persist({
        ...progress,
        completedChapters: [
          ...new Set([...progress.completedChapters, chapterId]),
        ],
        quizScores: { ...progress.quizScores, [chapterId]: quizScore },
        // Don't re-award XP for retaking a quiz already passed.
        totalXP: progress.totalXP + (alreadyComplete ? 0 : xpEarned),
        currentChapter: Number.isFinite(chapterNumber)
          ? Math.max(progress.currentChapter, chapterNumber + 1)
          : progress.currentChapter,
        lastAccessedAt: new Date().toISOString(),
      });
    },
    [progress, persist],
  );

  const isChapterUnlocked = useCallback(
    (chapterNumber: number) => {
      if (!progress) return false;
      if (chapterNumber === 1) return true;
      return progress.completedChapters.includes(`chapter-${chapterNumber - 1}`);
    },
    [progress],
  );

  const isSectionCompleted = useCallback(
    (chapterId: string, sectionId: string) =>
      progress?.completedSections.includes(`${chapterId}-${sectionId}`) ?? false,
    [progress],
  );

  const calculateStreak = useCallback(async () => {
    if (!progress) return;
    const next = applyStreak(progress);
    if (next !== progress) await persist(next);
  }, [progress, persist]);

  const resetProgress = useCallback(async () => {
    await persist({ ...initialProgress, lastAccessedAt: new Date().toISOString() });
  }, [persist]);

  const value = useMemo(
    () => ({
      progress,
      loading,
      error,
      updateProgress,
      completeSection,
      completeChapter,
      isChapterUnlocked,
      isSectionCompleted,
      calculateStreak,
      resetProgress,
    }),
    [
      progress,
      loading,
      error,
      updateProgress,
      completeSection,
      completeChapter,
      isChapterUnlocked,
      isSectionCompleted,
      calculateStreak,
      resetProgress,
    ],
  );

  return (
    <CourseProgressContext.Provider value={value}>
      {children}
    </CourseProgressContext.Provider>
  );
}

export function useCourseProgress() {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error(
      "useCourseProgress must be used within a CourseProgressProvider",
    );
  }
  return context;
}

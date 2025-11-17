import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseProgress } from '@/types/course';

interface CourseProgressContextType {
  progress: CourseProgress | null;
  loading: boolean;
  updateProgress: (updates: Partial<CourseProgress>) => Promise<void>;
  completeSection: (chapterId: string, sectionId: string, xpEarned: number) => Promise<void>;
  completeChapter: (chapterId: string, quizScore: number, xpEarned: number) => Promise<void>;
  isChapterUnlocked: (chapterNumber: number) => boolean;
  isSectionCompleted: (chapterId: string, sectionId: string) => boolean;
  calculateStreak: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'course_progress';

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

export function CourseProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedProgress = JSON.parse(stored);
        setProgress(parsedProgress);
        // Calculate streak on load
        await calculateStreakInternal(parsedProgress);
      } else {
        setProgress(initialProgress);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
      }
    } catch (error) {
      console.error('Error loading course progress:', error);
      setProgress(initialProgress);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<CourseProgress>) => {
    if (!progress) return;

    const updatedProgress = {
      ...progress,
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };

    setProgress(updatedProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
  };

  const completeSection = async (chapterId: string, sectionId: string, xpEarned: number) => {
    if (!progress) return;

    const sectionKey = `${chapterId}-${sectionId}`;
    if (progress.completedSections.includes(sectionKey)) return;

    const updatedProgress = {
      ...progress,
      completedSections: [...progress.completedSections, sectionKey],
      totalXP: progress.totalXP + xpEarned,
      lastAccessedAt: new Date().toISOString(),
    };

    setProgress(updatedProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
  };

  const completeChapter = async (chapterId: string, quizScore: number, xpEarned: number) => {
    if (!progress) return;

    const chapterNumber = parseInt(chapterId.split('-')[1]);
    const updatedProgress = {
      ...progress,
      completedChapters: [...new Set([...progress.completedChapters, chapterId])],
      quizScores: { ...progress.quizScores, [chapterId]: quizScore },
      totalXP: progress.totalXP + xpEarned,
      currentChapter: Math.max(progress.currentChapter, chapterNumber + 1),
      lastAccessedAt: new Date().toISOString(),
    };

    setProgress(updatedProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
  };

  const isChapterUnlocked = (chapterNumber: number): boolean => {
    if (!progress) return false;
    if (chapterNumber === 1) return true;
    
    const previousChapterId = `chapter-${chapterNumber - 1}`;
    return progress.completedChapters.includes(previousChapterId);
  };

  const isSectionCompleted = (chapterId: string, sectionId: string): boolean => {
    if (!progress) return false;
    return progress.completedSections.includes(`${chapterId}-${sectionId}`);
  };

  const calculateStreakInternal = async (currentProgress: CourseProgress) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!currentProgress.lastStreakDate) {
      const updatedProgress = {
        ...currentProgress,
        streakDays: 1,
        lastStreakDate: today.toISOString(),
      };
      setProgress(updatedProgress);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
      return;
    }

    const lastStreak = new Date(currentProgress.lastStreakDate);
    lastStreak.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - lastStreak.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
      return;
    } else if (diffDays === 1) {
      // Next day, increment streak
      const updatedProgress = {
        ...currentProgress,
        streakDays: currentProgress.streakDays + 1,
        lastStreakDate: today.toISOString(),
      };
      setProgress(updatedProgress);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
    } else {
      // Streak broken, reset to 1
      const updatedProgress = {
        ...currentProgress,
        streakDays: 1,
        lastStreakDate: today.toISOString(),
      };
      setProgress(updatedProgress);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress));
    }
  };

  const calculateStreak = async () => {
    if (progress) {
      await calculateStreakInternal(progress);
    }
  };

  const resetProgress = async () => {
    setProgress(initialProgress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
  };

  return (
    <CourseProgressContext.Provider
      value={{
        progress,
        loading,
        updateProgress,
        completeSection,
        completeChapter,
        isChapterUnlocked,
        isSectionCompleted,
        calculateStreak,
        resetProgress,
      }}
    >
      {children}
    </CourseProgressContext.Provider>
  );
}

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (context === undefined) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};

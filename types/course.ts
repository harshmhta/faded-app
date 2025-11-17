export interface CourseProgress {
  currentChapter: number;
  currentSection: number;
  completedSections: string[]; // Format: "chapterId-sectionId"
  completedChapters: string[];
  quizScores: Record<string, number>;
  lastAccessedAt: string;
  totalXP: number;
  streakDays: number;
  lastStreakDate: string | null;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'multi-select' | 'matching';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  matches?: {
    concepts: { id: string; text: string }[];
    definitions: { id: string; text: string }[];
    correctPairs: { conceptId: string; definitionId: string }[];
  };
  explanation?: string;
}

export interface CourseSection {
  id: string;
  title: string;
  content: string;
  readTime?: string;
  xpReward: number;
}

export interface CourseChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  sections: CourseSection[];
  quiz: {
    title: string;
    description: string;
    questions: QuizQuestion[];
    passingScore: number;
    xpReward: number;
  };
  locked: boolean;
  icon?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  chapters: CourseChapter[];
}

export interface HighlightedSection {
  start: number;
  end: number;
  content: string;
}

import { ContentCategory, ContentItem } from "@/types/content";

// Recovery and wellness content for quitting weed
export const sampleContent: ContentItem[] = [
  // Getting Started Content
  {
    id: "guide-start-1",
    title: "Your First Day: What to Expect",
    description: "A comprehensive guide to beginning your weed-free journey",
    type: "guide",
    category: "getting-started",
    readTime: "8 min read",
    tags: ["first-day", "expectations", "preparation"],
    difficulty: 1,
    featured: true,
  },
  {
    id: "video-start-1",
    title: "Why Quitting Weed Changed My Life",
    description: "Personal stories of transformation and recovery",
    type: "video",
    category: "getting-started",
    duration: "12:45",
    tags: ["motivation", "stories", "transformation"],
    difficulty: 1,
    featured: true,
  },
  {
    id: "guide-start-2",
    title: "Setting Yourself Up for Success",
    description: "Essential preparations and mindset shifts for quitting",
    type: "guide",
    category: "getting-started",
    readTime: "10 min read",
    tags: ["preparation", "mindset", "success"],
    difficulty: 1,
  },

  // Coping Strategies
  {
    id: "article-cope-1",
    title: "Managing Withdrawal Symptoms",
    description: "Natural ways to handle the physical and mental challenges",
    type: "article",
    category: "coping-strategies",
    readTime: "6 min read",
    tags: ["withdrawal", "symptoms", "natural-remedies"],
    difficulty: 2,
    featured: true,
  },
  {
    id: "exercise-cope-1",
    title: "10-Minute Anxiety Relief Workout",
    description: "Quick exercises to manage anxiety and restlessness",
    type: "exercise",
    category: "coping-strategies",
    duration: "10:00",
    tags: ["anxiety", "exercise", "relief"],
    difficulty: 2,
  },
  {
    id: "guide-cope-1",
    title: "Healthy Alternatives to Smoking",
    description: "Replace the habit with positive alternatives",
    type: "guide",
    category: "coping-strategies",
    readTime: "7 min read",
    tags: ["alternatives", "habits", "replacement"],
    difficulty: 2,
  },

  // Health & Wellness
  {
    id: "article-health-1",
    title: "How Your Body Heals After Quitting",
    description: "The amazing recovery timeline your body experiences",
    type: "article",
    category: "health-wellness",
    readTime: "9 min read",
    tags: ["healing", "recovery", "timeline"],
    difficulty: 1,
  },
  {
    id: "guide-health-1",
    title: "Nutrition for Recovery",
    description: "Foods that support your brain and body during recovery",
    type: "guide",
    category: "health-wellness",
    readTime: "12 min read",
    tags: ["nutrition", "brain-health", "recovery"],
    difficulty: 2,
  },
  {
    id: "exercise-health-1",
    title: "Morning Energy Boost Routine",
    description: "Start your day with natural energy and clarity",
    type: "exercise",
    category: "health-wellness",
    duration: "15:00",
    tags: ["morning", "energy", "routine"],
    difficulty: 2,
  },

  // Mindfulness & Mental Health
  {
    id: "meditation-mind-1",
    title: "Craving Release Meditation",
    description: "Guided meditation to work through intense cravings",
    type: "meditation",
    category: "mindfulness",
    duration: "12:00",
    tags: ["meditation", "cravings", "mindfulness"],
    difficulty: 2,
    featured: true,
  },
  {
    id: "meditation-mind-2",
    title: "Daily Mindfulness Practice",
    description: "Build awareness and presence in your daily life",
    type: "meditation",
    category: "mindfulness",
    duration: "8:00",
    tags: ["daily-practice", "awareness", "presence"],
    difficulty: 1,
  },
  {
    id: "article-mind-1",
    title: "Understanding Your Triggers",
    description: "Identify and work with the emotional roots of your habit",
    type: "article",
    category: "mindfulness",
    readTime: "11 min read",
    tags: ["triggers", "emotions", "awareness"],
    difficulty: 3,
  },

  // Community & Support
  {
    id: "guide-community-1",
    title: "Building Your Support Network",
    description: "How to find and maintain supportive relationships",
    type: "guide",
    category: "community",
    readTime: "8 min read",
    tags: ["support", "relationships", "community"],
    difficulty: 2,
  },
  {
    id: "article-community-1",
    title: "Talking to Friends and Family",
    description: "How to communicate your journey and get support",
    type: "article",
    category: "community",
    readTime: "6 min read",
    tags: ["communication", "family", "friends"],
    difficulty: 2,
  },

  // Relapse Prevention
  {
    id: "guide-relapse-1",
    title: "Creating Your Relapse Prevention Plan",
    description: "Strategies to stay on track during challenging times",
    type: "guide",
    category: "relapse-prevention",
    readTime: "15 min read",
    tags: ["prevention", "planning", "strategies"],
    difficulty: 3,
  },
  {
    id: "article-relapse-1",
    title: "What to Do If You Slip Up",
    description: "Getting back on track with compassion and wisdom",
    type: "article",
    category: "relapse-prevention",
    readTime: "7 min read",
    tags: ["relapse", "recovery", "self-compassion"],
    difficulty: 3,
    featured: true,
  },
];

export const contentCategories: ContentCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Begin your journey to freedom",
    icon: "🌱",
    color: "#4CAF50",
    items: sampleContent.filter((item) => item.category === "getting-started"),
  },
  {
    id: "coping-strategies",
    name: "Coping Strategies",
    description: "Tools to handle challenges",
    icon: "🛡️",
    color: "#2196F3",
    items: sampleContent.filter(
      (item) => item.category === "coping-strategies",
    ),
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    description: "Heal your body and mind",
    icon: "💚",
    color: "#8BC34A",
    items: sampleContent.filter((item) => item.category === "health-wellness"),
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Build awareness and peace",
    icon: "🧘",
    color: "#9C27B0",
    items: sampleContent.filter((item) => item.category === "mindfulness"),
  },
  {
    id: "community",
    name: "Community & Support",
    description: "Connect and find support",
    icon: "🤝",
    color: "#FF9800",
    items: sampleContent.filter((item) => item.category === "community"),
  },
  {
    id: "relapse-prevention",
    name: "Relapse Prevention",
    description: "Stay strong and committed",
    icon: "🔒",
    color: "#F44336",
    items: sampleContent.filter(
      (item) => item.category === "relapse-prevention",
    ),
  },
];

// Helper functions
export const getFeaturedContent = (): ContentItem[] => {
  return sampleContent.filter((item) => item.featured);
};

export const getContentByType = (
  type: "video" | "guide" | "article" | "meditation" | "exercise",
): ContentItem[] => {
  return sampleContent.filter((item) => item.type === type);
};

export const getContentByCategory = (category: string): ContentItem[] => {
  return sampleContent.filter((item) => item.category === category);
};

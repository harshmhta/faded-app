export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "video" | "guide" | "article" | "meditation" | "exercise";
  category:
    | "getting-started"
    | "coping-strategies"
    | "health-wellness"
    | "mindfulness"
    | "community"
    | "relapse-prevention";
  duration?: string; // For videos/meditations
  readTime?: string; // For guides/articles
  thumbnail?: string;
  url?: string;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  featured?: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  items: ContentItem[];
}

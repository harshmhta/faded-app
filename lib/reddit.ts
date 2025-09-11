import { RedditPost } from "@/components/RedditPostCard";

const REDDIT_BASE_URL = "https://www.reddit.com";

export interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        author: string;
        score: number;
        num_comments: number;
        created_utc: number;
        selftext: string;
        url: string;
        permalink: string;
        stickied: boolean;
        over_18: boolean;
      };
    }>;
  };
}

export async function fetchSubredditPosts(
  subreddit: string,
  sort: "hot" | "new" | "top" = "hot",
  limit: number = 25,
): Promise<RedditPost[]> {
  try {
    const response = await fetch(
      `${REDDIT_BASE_URL}/r/${subreddit}/${sort}.json?limit=${limit}`,
      {
        headers: {
          "User-Agent": "Faded App/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const data: RedditApiResponse = await response.json();

    // Filter out stickied posts and NSFW content
    const posts = data.data.children
      .filter((child) => !child.data.stickied && !child.data.over_18)
      .map((child) => ({
        id: child.data.id,
        title: child.data.title,
        author: child.data.author,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        selftext: child.data.selftext,
        url: child.data.url,
        permalink: child.data.permalink,
      }));

    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    throw error;
  }
}

export const SUBREDDITS = {
  LEAVES: "leaves",
  PETIOLES: "Petioles",
} as const;

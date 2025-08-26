export interface RedditPost {
  id: string;
  title: string;
  author: string;
  created_utc: number;
  ups: number;
  downs: number;
  num_comments: number;
  permalink: string;
  url: string;
  selftext: string;
  selftext_html: string | null;
  thumbnail: string | null;
  preview?: {
    images: Array<{
      source: {
        url: string;
        width: number;
        height: number;
      };
      resolutions: Array<{
        url: string;
        width: number;
        height: number;
      }>;
    }>;
  };
  over_18: boolean;
  stickied: boolean;
  locked: boolean;
  spoiler: boolean;
  score: number;
  subreddit: string;
  subreddit_name_prefixed: string;
}

export interface RedditComment {
  id: string;
  author: string;
  created_utc: number;
  body: string;
  body_html: string | null;
  ups: number;
  downs: number;
  score: number;
  depth: number;
  parent_id: string;
  permalink: string;
  replies?: RedditCommentListing | string;
  is_submitter: boolean;
  stickied: boolean;
  score_hidden: boolean;
  collapsed: boolean;
  controversiality: number;
}

export interface RedditCommentChild {
  kind: string;
  data: RedditComment;
}

export interface RedditCommentListing {
  kind: string;
  data: {
    modhash: string;
    dist: number;
    children: RedditCommentChild[];
    after: string | null;
    before: string | null;
  };
}

export interface RedditChild {
  kind: string;
  data: RedditPost;
}

export interface RedditListing {
  kind: string;
  data: {
    modhash: string;
    dist: number;
    children: RedditChild[];
    after: string | null;
    before: string | null;
  };
}

type SortType = "hot" | "new" | "top" | "rising";

class RedditApiService {
  private baseUrl = "https://www.reddit.com";

  async getLeavesPosts(
    sort: SortType = "hot",
    limit: number = 25,
    after?: string,
  ): Promise<RedditListing> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(after && { after }),
      });

      const url = `${this.baseUrl}/r/leaves/${sort}.json?${params}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "FadedApp/1.0.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      throw error;
    }
  }

  async getPostComments(
    postId: string,
    sort:
      | "best"
      | "top"
      | "new"
      | "controversial"
      | "old"
      | "random"
      | "qa"
      | "live" = "best",
    limit: number = 50,
  ): Promise<{ post: RedditPost; comments: RedditComment[] }> {
    try {
      const params = new URLSearchParams({
        sort,
        limit: limit.toString(),
        raw_json: "1", // Get raw JSON without HTML encoding
      });

      const url = `${this.baseUrl}/r/leaves/comments/${postId}.json?${params}`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "FadedApp/1.0.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();

      // Reddit returns an array: [post_listing, comments_listing]
      const postListing = data[0] as RedditListing;
      const commentsListing = data[1] as RedditCommentListing;

      const post = postListing.data.children[0]?.data;
      if (!post) {
        throw new Error("Post not found");
      }

      // Flatten comments recursively
      const comments = this.flattenComments(commentsListing.data.children);

      return { post, comments };
    } catch (error) {
      console.error("Error fetching Reddit comments:", error);
      throw error;
    }
  }

  private flattenComments(children: RedditCommentChild[]): RedditComment[] {
    const comments: RedditComment[] = [];

    for (const child of children) {
      if (child.kind === "t1" && child.data) {
        // t1 = comment
        comments.push(child.data);

        // Process replies if they exist
        if (child.data.replies && typeof child.data.replies === "object") {
          const replies = this.flattenComments(
            child.data.replies.data.children,
          );
          comments.push(...replies);
        }
      }
    }

    return comments;
  }

  formatRelativeTime(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) {
      return "Just now";
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h ago`;
    } else if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days}d ago`;
    } else {
      const weeks = Math.floor(diff / 604800);
      return `${weeks}w ago`;
    }
  }

  getPostPreview(post: RedditPost, maxLength: number = 200): string | null {
    if (!post.selftext || post.selftext.trim() === "") {
      return null;
    }

    const text = post.selftext
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");

    if (text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength).trim() + "...";
  }

  formatScore(score: number): string {
    if (score >= 1000000) {
      return (score / 1000000).toFixed(1) + "M";
    } else if (score >= 1000) {
      return (score / 1000).toFixed(1) + "K";
    }
    return score.toString();
  }
}

export const redditApi = new RedditApiService();
export default redditApi;

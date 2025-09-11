import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ArrowUp01Icon,
  Comment01Icon,
  ShareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  selftext: string;
  url: string;
  permalink: string;
}

interface RedditPostCardProps {
  post: RedditPost;
  style?: any;
  onPress?: (post: RedditPost) => void;
}

export function RedditPostCard({ post, style, onPress }: RedditPostCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 3600) {
      return `${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)}h ago`;
    } else if (diff < 604800) {
      return `${Math.floor(diff / 86400)}d ago`;
    } else {
      return `${Math.floor(diff / 604800)}w ago`;
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(post);
    } else {
      Linking.openURL(`https://reddit.com${post.permalink}`);
    }
  };

  const handleShare = () => {
    // You can implement share functionality here
    Linking.openURL(`https://reddit.com${post.permalink}`);
  };

  const borderColor = isDark ? "#2A2A2A" : "#E6E8EB";
  const cardBackground = isDark ? "#181A1B" : "#F6F7F9";

  return (
    <Pressable onPress={handlePress} style={[styles.wrapper, style]}>
      <ThemedView
        lightColor="#F6F7F9"
        darkColor="#181A1B"
        style={[styles.card, { borderColor }]}
      >
        {/* Header with author and time */}
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <ThemedText style={styles.author}>u/{post.author}</ThemedText>
            <ThemedText style={styles.time}>
              {formatTimeAgo(post.created_utc)}
            </ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText type="defaultSemiBold" style={styles.title}>
          {post.title}
        </ThemedText>

        {/* Body text preview if available */}
        {post.selftext && post.selftext.length > 0 && (
          <ThemedText numberOfLines={3} style={styles.bodyText}>
            {post.selftext}
          </ThemedText>
        )}

        {/* Footer with stats */}
        <View style={styles.footer}>
          <View style={styles.stat}>
            <HugeiconsIcon
              icon={ArrowUp01Icon}
              size={16}
              color={isDark ? "#9BA1A6" : "#687076"}
            />
            <ThemedText style={styles.statText}>{post.score}</ThemedText>
          </View>

          <View style={styles.stat}>
            <HugeiconsIcon
              icon={Comment01Icon}
              size={16}
              color={isDark ? "#9BA1A6" : "#687076"}
            />
            <ThemedText style={styles.statText}>{post.num_comments}</ThemedText>
          </View>

          <Pressable onPress={handleShare} style={styles.shareButton}>
            <HugeiconsIcon
              icon={ShareIcon}
              size={16}
              color={isDark ? "#9BA1A6" : "#687076"}
            />
          </Pressable>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  author: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  time: {
    fontSize: 12,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 12,
    fontFamily: FontFamily.regular,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  shareButton: {
    marginLeft: "auto",
    padding: 4,
  },
});

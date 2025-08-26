import { GradientAvatar } from "@/components/GradientAvatar";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RedditComment, redditApi } from "@/services/redditApi";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface RedditCommentCardProps {
  comment: RedditComment;
  isOP?: boolean;
}

export default function RedditCommentCard({
  comment,
  isOP = false,
}: RedditCommentCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const tintColor = useThemeColor({}, "tint");

  // Clean up comment body from HTML entities and markdown
  const cleanCommentBody = (body: string): string => {
    return body
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/\n\n/g, "\n") // Reduce double line breaks
      .trim();
  };

  // Generate consistent colors for users based on their username
  const getUserColor = (username: string) => {
    const colors = [
      ["#FF6B6B", "#FF8E8E"], // Red gradient
      ["#4ECDC4", "#6EDBD6"], // Teal gradient
      ["#45B7D1", "#67C3DB"], // Blue gradient
      ["#96CEB4", "#B2D8C2"], // Green gradient
      ["#FFEAA7", "#FFEFB8"], // Yellow gradient
      ["#DDA0DD", "#E8B5E8"], // Purple gradient
      ["#FFA07A", "#FFBFA0"], // Orange gradient
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Don't render if comment body is empty or deleted
  if (
    !comment.body ||
    comment.body === "[deleted]" ||
    comment.body === "[removed]"
  ) {
    return null;
  }

  const userColors = getUserColor(comment.author) as [string, string];

  return (
    <View
      style={[
        styles.container,
        { marginLeft: Math.min(comment.depth * 16, 60) }, // Indent for replies
      ]}
    >
      <Pressable
        onPress={handleToggleCollapse}
        style={({ pressed }) => [
          styles.commentCard,
          { backgroundColor: pressed ? mutedColor + "05" : backgroundColor },
          collapsed && { opacity: 0.7 },
        ]}
      >
        {/* Comment Header */}
        <View style={styles.header}>
          <GradientAvatar colors={userColors} size={32} style={styles.avatar} />
          <View style={styles.authorInfo}>
            <ThemedText style={[styles.authorName, { color: textColor }]}>
              {comment.author}
              {isOP && (
                <ThemedText style={[styles.opBadge, { color: tintColor }]}>
                  {" "}
                  • OP
                </ThemedText>
              )}
            </ThemedText>
            <ThemedText style={[styles.timeText, { color: mutedColor }]}>
              {redditApi.formatRelativeTime(comment.created_utc)}
            </ThemedText>
          </View>
        </View>

        {/* Comment Body */}
        {!collapsed && (
          <View style={styles.bodyContainer}>
            <ThemedText style={[styles.bodyText, { color: textColor }]}>
              {cleanCommentBody(comment.body)}
            </ThemedText>

            {/* Engagement */}
            <View style={styles.engagement}>
              {!comment.score_hidden && (
                <Pressable style={styles.engagementItem}>
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={14}
                    color="#FF6B6B"
                    strokeWidth={2.0}
                    variant="stroke"
                  />
                  <ThemedText
                    style={[styles.engagementCount, { color: mutedColor }]}
                  >
                    {Math.abs(comment.score)}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Collapsed Indicator */}
        {collapsed && (
          <View
            style={[
              styles.collapsedIndicator,
              { backgroundColor: mutedColor + "10" },
            ]}
          >
            <ThemedText style={[styles.collapsedText, { color: mutedColor }]}>
              Tap to expand comment
            </ThemedText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  commentCard: {
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 18,
  },
  opBadge: {
    fontSize: 14,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },

  bodyContainer: {
    paddingLeft: 42, // Align with text after avatar
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 8,
  },
  engagement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  engagementCount: {
    fontSize: 13,
    fontWeight: "500",
  },
  collapsedIndicator: {
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
    marginLeft: 42,
  },
  collapsedText: {
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "500",
  },
});

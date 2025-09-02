import { GradientAvatar } from "@/components/GradientAvatar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RedditPost, redditApi } from "@/services/redditApi";
import { FavouriteIcon, Message01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface RedditPostCardProps {
  post: RedditPost;
  onPress?: () => void;
}

export default function RedditPostCard({ post, onPress }: RedditPostCardProps) {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");

  const getPostPreview = () => {
    return redditApi.getPostPreview(post, 120);
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

  const userColors = getUserColor(post.author) as [string, string];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        {/* Header with author */}
        <View style={styles.header}>
          <GradientAvatar colors={userColors} size={36} style={styles.avatar} />
          <View style={styles.authorInfo}>
            <ThemedText style={[styles.authorName, { color: textColor }]}>
              {post.author}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
              r/leaves
            </ThemedText>
          </View>
          <ThemedText style={[styles.timeText, { color: mutedColor }]}>
            {redditApi.formatRelativeTime(post.created_utc)}
          </ThemedText>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <ThemedText style={[styles.postText, { color: textColor }]}>
            {post.title}
          </ThemedText>

          {getPostPreview() && (
            <ThemedText
              style={[styles.preview, { color: mutedColor }]}
              numberOfLines={3}
            >
              {getPostPreview()}
            </ThemedText>
          )}
        </View>

        {/* Footer with engagement */}
        <View style={styles.footer}>
          <View style={styles.engagement}>
            <Pressable style={styles.engagementItem}>
              <HugeiconsIcon
                icon={FavouriteIcon}
                size={16}
                color="#FF6B6B"
                strokeWidth={2.0}
                variant="stroke"
              />
              <ThemedText
                style={[styles.engagementCount, { color: mutedColor }]}
              >
                {redditApi.formatScore(post.ups)}
              </ThemedText>
            </Pressable>

            <Pressable style={styles.engagementItem}>
              <HugeiconsIcon
                icon={Message01Icon}
                size={16}
                color={mutedColor}
                strokeWidth={2.0}
                variant="stroke"
              />
              <ThemedText
                style={[styles.engagementCount, { color: mutedColor }]}
              >
                {post.num_comments}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 0,
    borderRadius: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  pressable: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.95,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 15,
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "400",
  },
  contentContainer: {
    marginBottom: 14,
  },
  postText: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    marginBottom: 6,
  },
  preview: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  engagement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  engagementCount: {
    fontSize: 13,
    fontWeight: "500",
  },
});

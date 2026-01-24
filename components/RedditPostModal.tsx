import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    ArrowUp01Icon,
    ArrowUpRight03Icon,
    Comment01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RedditPost } from "./RedditPostCard";

interface RedditPostModalProps {
  visible: boolean;
  post: RedditPost | null;
  onClose: () => void;
}

interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  replies?: RedditComment[];
  depth: number;
}

const { height } = Dimensions.get("window");

export function RedditPostModal({
  visible,
  post,
  onClose,
}: RedditPostModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    if (visible && post) {
      fetchComments();
    }
  }, [visible, post]);

  const fetchComments = async () => {
    if (!post) return;

    setLoadingComments(true);
    try {
      const response = await fetch(
        `https://www.reddit.com${post.permalink}.json`,
        {
          headers: {
            "User-Agent": "Faded App/1.0",
          },
        },
      );

      const data = await response.json();
      if (data && data[1] && data[1].data && data[1].data.children) {
        const parsedComments = parseComments(data[1].data.children, 0);
        setComments(parsedComments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const parseComments = (children: any[], depth: number): RedditComment[] => {
    return children
      .filter(
        (child) => child.kind === "t1" && child.data.author !== "[deleted]",
      )
      .map((child) => {
        const comment: RedditComment = {
          id: child.data.id,
          author: child.data.author,
          body: child.data.body,
          score: child.data.score,
          created_utc: child.data.created_utc,
          depth,
        };

        if (
          child.data.replies &&
          child.data.replies.data &&
          child.data.replies.data.children
        ) {
          comment.replies = parseComments(
            child.data.replies.data.children,
            depth + 1,
          );
        }

        return comment;
      });
  };

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

  const handleOpenInReddit = () => {
    if (post) {
      Linking.openURL(`https://reddit.com${post.permalink}`);
    }
  };

  const renderComment = (comment: RedditComment) => {
    const borderColor = isDark ? "#2A2A2A" : "#E6E8EB";
    const commentBackground = isDark ? "#181A1B" : "#F6F7F9";

    return (
      <View key={comment.id} style={{ marginLeft: comment.depth * 16 }}>
        <View
          style={[
            styles.commentCard,
            {
              borderColor,
              backgroundColor: commentBackground,
              marginLeft: comment.depth > 0 ? 8 : 0,
            },
          ]}
        >
          <View style={styles.commentHeader}>
            <ThemedText style={styles.commentAuthor}>
              u/{comment.author}
            </ThemedText>
            <ThemedText style={styles.commentTime}>
              {formatTimeAgo(comment.created_utc)}
            </ThemedText>
          </View>
          <ThemedText style={styles.commentBody}>{comment.body}</ThemedText>
          <View style={styles.commentFooter}>
            <View style={styles.commentStat}>
              <HugeiconsIcon
                icon={ArrowUp01Icon}
                size={14}
                color={isDark ? "#9BA1A6" : "#687076"}
              />
              <ThemedText style={styles.commentStatText}>
                {comment.score}
              </ThemedText>
            </View>
          </View>
        </View>
        {comment.replies &&
          comment.replies.map((reply) => renderComment(reply))}
      </View>
    );
  };

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView
        style={styles.container}
        lightColor={Colors.light.background}
        darkColor={Colors.dark.background}
      >
        {/* Header */}
        <View
          style={[styles.header, { paddingTop: 15 }, { paddingBottom: 15 }]}
        >
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, isDark && styles.closeButtonDark]}
          >
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Post Content */}
          <View style={styles.postContent}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <ThemedText style={styles.author}>u/{post.author}</ThemedText>
                <ThemedText style={styles.time}>
                  {formatTimeAgo(post.created_utc)}
                </ThemedText>
              </View>
              <Pressable
                onPress={handleOpenInReddit}
                style={styles.redditLinkContainer}
              >
                <ThemedText style={styles.redditLinkText}>Reddit</ThemedText>
                <HugeiconsIcon
                  icon={ArrowUpRight03Icon}
                  size={14}
                  color="#FF4500"
                />
              </Pressable>
            </View>

            {/* Post Title */}
            <ThemedText type="subtitle" style={styles.title}>
              {post.title}
            </ThemedText>

            {/* Post Body */}
            {post.selftext && post.selftext.length > 0 && (
              <ThemedText style={styles.bodyText}>{post.selftext}</ThemedText>
            )}

            {/* Post Stats */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <HugeiconsIcon
                  icon={ArrowUp01Icon}
                  size={18}
                  color={isDark ? "#9BA1A6" : "#687076"}
                />
                <ThemedText style={styles.statText}>{post.score}</ThemedText>
              </View>
              <View style={styles.stat}>
                <HugeiconsIcon
                  icon={Comment01Icon}
                  size={18}
                  color={isDark ? "#9BA1A6" : "#687076"}
                />
                <ThemedText style={styles.statText}>
                  {post.num_comments} comments
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <ThemedText type="defaultSemiBold" style={styles.commentsTitle}>
              Comments
            </ThemedText>

            {loadingComments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
              </View>
            ) : comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments.map((comment) => renderComment(comment))}
              </View>
            ) : (
              <ThemedText style={styles.noComments}>No comments yet</ThemedText>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.06)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  closeText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  postContent: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  postHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
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
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontFamily: FontFamily.regular,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  commentsSection: {
    paddingTop: 20,
  },
  commentsTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  commentsList: {
    gap: 12,
  },
  commentCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  commentTime: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
  commentBody: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontFamily.regular,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: "row",
  },
  commentStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentStatText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.7,
  },
  noComments: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
    padding: 40,
    fontFamily: FontFamily.regular,
  },
  redditLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  redditLinkText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#FF4500",
  },
});

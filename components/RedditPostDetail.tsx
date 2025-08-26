import RedditCommentCard from "@/components/RedditCommentCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { RedditComment, RedditPost, redditApi } from "@/services/redditApi";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface RedditPostDetailProps {
  post: RedditPost;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");

export default function RedditPostDetail({
  post,
  onClose,
}: RedditPostDetailProps) {
  const [imageExpanded, setImageExpanded] = useState(false);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentSort, setCommentSort] = useState<
    "best" | "top" | "new" | "controversial" | "old"
  >("best");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "tabIconDefault");
  const tintColor = useThemeColor({}, "tint");
  const insets = useSafeAreaInsets();

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [post.id, commentSort]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      setCommentsError(null);

      const { comments: fetchedComments } = await redditApi.getPostComments(
        post.id,
        commentSort,
      );
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentsError("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const handleCommentSortChange = (sort: typeof commentSort) => {
    setCommentSort(sort);
  };

  const hasImage =
    post.thumbnail &&
    post.thumbnail !== "self" &&
    post.thumbnail !== "default" &&
    post.thumbnail !== "nsfw" &&
    post.thumbnail !== "spoiler";

  const hasLargeImage =
    post.url &&
    (post.url.includes(".jpg") ||
      post.url.includes(".jpeg") ||
      post.url.includes(".png") ||
      post.url.includes(".gif") ||
      post.url.includes("i.redd.it") ||
      post.url.includes("imgur.com"));

  const getImageUrl = (): string | undefined => {
    if (hasLargeImage) {
      // For Reddit images, try to get the full resolution
      if (post.url.includes("i.redd.it")) {
        return post.url;
      }
      // For other image URLs
      if (
        post.url.includes(".jpg") ||
        post.url.includes(".jpeg") ||
        post.url.includes(".png") ||
        post.url.includes(".gif")
      ) {
        return post.url;
      }
    }
    return post.thumbnail || undefined;
  };

  const hasExternalLink =
    post.url && post.url !== `https://www.reddit.com${post.permalink}`;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
      >
        {/* Subreddit Header */}
        <View style={styles.subredditHeader}>
          <View
            style={[
              styles.subredditBadge,
              { backgroundColor: tintColor + "20" },
            ]}
          >
            <ThemedText style={[styles.subredditText, { color: tintColor }]}>
              r/leaves
            </ThemedText>
          </View>
        </View>

        {/* Post Meta */}
        <View style={styles.postMeta}>
          <View style={styles.authorSection}>
            <View
              style={[
                styles.authorBadge,
                { backgroundColor: tintColor + "15" },
              ]}
            >
              <ThemedText style={[styles.authorText, { color: tintColor }]}>
                u/{post.author}
              </ThemedText>
            </View>
            <ThemedText style={[styles.timeText, { color: mutedColor }]}>
              {redditApi.formatRelativeTime(post.created_utc)}
            </ThemedText>
          </View>

          {/* Badges */}
          <View style={styles.badges}>
            {post.over_18 && (
              <View style={styles.nsfwBadge}>
                <ThemedText style={styles.badgeText}>18+</ThemedText>
              </View>
            )}
            {post.stickied && (
              <View style={styles.pinnedBadge}>
                <ThemedText style={styles.badgeText}>📌</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <ThemedText style={[styles.title, { color: textColor }]}>
          {post.title}
        </ThemedText>

        {/* Post Content */}
        <View style={styles.postContent}>
          {/* Text Content */}
          {post.selftext && post.selftext.length > 0 && (
            <View
              style={[
                styles.textContent,
                { backgroundColor: mutedColor + "10" },
              ]}
            >
              <ThemedText style={[styles.selfText, { color: textColor }]}>
                {post.selftext}
              </ThemedText>
            </View>
          )}

          {/* Image */}
          {(hasImage || hasLargeImage) && (
            <Pressable
              style={styles.imageContainer}
              onPress={() => setImageExpanded(!imageExpanded)}
            >
              <Image
                source={{ uri: getImageUrl() }}
                style={[
                  styles.postImage,
                  imageExpanded ? styles.expandedImage : styles.normalImage,
                ]}
                resizeMode={imageExpanded ? "contain" : "cover"}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.3)"]}
                style={styles.imageOverlay}
              />
              {!imageExpanded && (
                <View style={styles.expandIndicator}>
                  <ThemedText style={styles.expandText}>
                    Tap to expand
                  </ThemedText>
                </View>
              )}
            </Pressable>
          )}

          {/* External Link Preview */}
          {hasExternalLink && !hasLargeImage && (
            <TouchableOpacity
              style={[
                styles.linkPreview,
                {
                  borderColor: tintColor + "40",
                  backgroundColor: tintColor + "10",
                },
              ]}
              onPress={() => handleLinkPress(post.url)}
              activeOpacity={0.8}
            >
              <View style={[styles.linkIcon, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.linkIconText}>🔗</ThemedText>
              </View>
              <View style={styles.linkInfo}>
                <ThemedText
                  style={[styles.linkTitle, { color: textColor }]}
                  numberOfLines={2}
                >
                  External Link
                </ThemedText>
                <ThemedText
                  style={[styles.linkUrl, { color: mutedColor }]}
                  numberOfLines={1}
                >
                  {post.url}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats and Actions */}
        <View style={styles.statsSection}>
          <View style={styles.stats}>
            <View
              style={[styles.statItem, { backgroundColor: tintColor + "15" }]}
            >
              <ThemedText style={[styles.statText, { color: tintColor }]}>
                ⬆ {redditApi.formatScore(post.ups)}
              </ThemedText>
            </View>

            <View
              style={[styles.statItem, { backgroundColor: mutedColor + "15" }]}
            >
              <ThemedText style={[styles.statText, { color: mutedColor }]}>
                💬 {post.num_comments} comments
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {hasExternalLink && (
              <TouchableOpacity
                onPress={() => handleLinkPress(post.url)}
                style={[styles.actionButton, { backgroundColor: mutedColor }]}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.actionButtonText}>
                  🔗 Open Link
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          {/* Comments Header */}
          <View
            style={[
              styles.commentsHeader,
              { borderBottomColor: mutedColor + "20" },
            ]}
          >
            <View style={styles.commentsHeaderLeft}>
              <ThemedText style={[styles.commentsTitle, { color: textColor }]}>
                💬 Comments ({post.num_comments})
              </ThemedText>
            </View>

            {/* Comment Sort Options */}
            <View style={styles.commentSortContainer}>
              {(["best", "top", "new"] as const).map((sort) => (
                <Pressable
                  key={sort}
                  onPress={() => handleCommentSortChange(sort)}
                  style={({ pressed }) => [
                    styles.commentSortButton,
                    commentSort === sort && styles.activeCommentSortButton,
                    pressed && styles.pressedCommentSortButton,
                    {
                      borderColor:
                        commentSort === sort ? tintColor : mutedColor + "40",
                    },
                  ]}
                >
                  {commentSort === sort && (
                    <LinearGradient
                      colors={[tintColor, tintColor + "dd"]}
                      style={styles.commentSortButtonGradient}
                    />
                  )}
                  <ThemedText
                    style={[
                      styles.commentSortButtonText,
                      { color: commentSort === sort ? "white" : textColor },
                    ]}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Comments Content */}
          <View style={styles.commentsContent}>
            {loadingComments ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="large" color={tintColor} />
                <ThemedText
                  style={[styles.loadingCommentsText, { color: mutedColor }]}
                >
                  Loading comments...
                </ThemedText>
              </View>
            ) : commentsError ? (
              <View style={styles.commentsError}>
                <View
                  style={[styles.errorIcon, { backgroundColor: "#ef444420" }]}
                >
                  <ThemedText style={styles.errorIconText}>❌</ThemedText>
                </View>
                <ThemedText style={[styles.errorText, { color: "#ef4444" }]}>
                  {commentsError}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: tintColor }]}
                  onPress={fetchComments}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.retryButtonText}>
                    🔄 Retry
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.noComments}>
                <View
                  style={[
                    styles.noCommentsIcon,
                    { backgroundColor: mutedColor + "20" },
                  ]}
                >
                  <ThemedText style={styles.noCommentsIconText}>💬</ThemedText>
                </View>
                <ThemedText
                  style={[styles.noCommentsText, { color: mutedColor }]}
                >
                  No comments yet. Be the first to comment on Reddit!
                </ThemedText>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <RedditCommentCard
                    key={comment.id}
                    comment={comment}
                    isOP={comment.author === post.author}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Close Button */}
      <TouchableOpacity
        onPress={onClose}
        style={[
          styles.floatingCloseButton,
          {
            backgroundColor: mutedColor + "80",
            top: 23,
          },
        ]}
        activeOpacity={0.7}
      >
        <ThemedText
          style={[styles.floatingCloseButtonText, { color: textColor }]}
        >
          ✕
        </ThemedText>
      </TouchableOpacity>

      {/* Floating View on Reddit Button */}
      <TouchableOpacity
        onPress={() =>
          handleLinkPress(`https://www.reddit.com${post.permalink}`)
        }
        style={[styles.floatingRedditButton, { backgroundColor: tintColor }]}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[tintColor, tintColor + "dd"]}
          style={styles.floatingButtonGradient}
        />
        <ThemedText style={styles.floatingButtonText}>
          💬 View on Reddit
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    // paddingTop applied dynamically in component
  },
  floatingCloseButton: {
    position: "absolute",
    // top applied dynamically in component
    left: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingCloseButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  subredditHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  subredditBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subredditText: {
    fontSize: 14,
    fontWeight: "700",
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  authorText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  nsfwBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pinnedBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  postContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  textContent: {
    padding: 16,
    borderRadius: 12,
  },
  selfText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  postImage: {
    width: "100%",
    borderRadius: 16,
  },
  normalImage: {
    height: 250,
  },
  expandedImage: {
    height: 400,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  expandIndicator: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expandText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  linkPreview: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
    alignItems: "center",
  },
  linkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  linkIconText: {
    fontSize: 20,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSpacing: {
    height: 100, // Extra space for floating button
  },
  floatingRedditButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 34 : 20, // Account for home indicator
    left: 20,
    right: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  floatingButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  // Comments Section Styles
  commentsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  commentsHeaderLeft: {
    flex: 1,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  commentSortContainer: {
    flexDirection: "row",
    gap: 8,
  },
  commentSortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  activeCommentSortButton: {
    borderWidth: 0,
  },
  pressedCommentSortButton: {
    transform: [{ scale: 0.95 }],
  },
  commentSortButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  commentSortButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  commentsContent: {
    minHeight: 200,
  },
  commentsLoading: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  loadingCommentsText: {
    fontSize: 16,
    fontWeight: "500",
  },
  commentsError: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  errorIconText: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  noComments: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  noCommentsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsIconText: {
    fontSize: 32,
  },
  noCommentsText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  commentsList: {
    gap: 4,
  },
});

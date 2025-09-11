import { RedditPost, RedditPostCard } from "@/components/RedditPostCard";
import { RedditPostModal } from "@/components/RedditPostModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { fetchSubredditPosts, SUBREDDITS } from "@/lib/reddit";
import {
  CheckmarkCircle02Icon,
  MinusSignCircleIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(
    null,
  );
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const loadPosts = async (subreddit: string, isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const fetchedPosts = await fetchSubredditPosts(subreddit, "hot", 20);
      setPosts(fetchedPosts);
    } catch (err) {
      setError("Failed to load posts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSelectModerate = () => {
    setSelectedSubreddit(SUBREDDITS.PETIOLES);
    loadPosts(SUBREDDITS.PETIOLES);
  };

  const handleSelectQuit = () => {
    setSelectedSubreddit(SUBREDDITS.LEAVES);
    loadPosts(SUBREDDITS.LEAVES);
  };

  const handleRefresh = () => {
    if (selectedSubreddit) {
      setRefreshing(true);
      loadPosts(selectedSubreddit, true);
    }
  };

  const handlePostPress = (post: RedditPost) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {!selectedSubreddit && (
        <View style={styles.communitySelection}>
          <ThemedText type="subtitle" style={styles.selectionTitle}>
            Choose Your Path
          </ThemedText>
          <ThemedText style={styles.selectionDescription}>
            Connect with a supportive community that matches your goals
          </ThemedText>

          <View style={styles.optionsContainer}>
            {/* Moderate Option */}
            <Pressable
              style={[
                styles.optionCard,
                isDark && styles.optionCardDark,
                styles.moderateCard,
              ]}
              onPress={handleSelectModerate}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  styles.moderateIconContainer,
                ]}
              >
                <HugeiconsIcon
                  icon={MinusSignCircleIcon}
                  size={28}
                  color="#FF9500"
                />
              </View>
              <ThemedText type="subtitle" style={styles.optionTitle}>
                Moderate Usage
              </ThemedText>
              <ThemedText style={styles.optionDescription}>
                Join r/Petioles - A community focused on responsible use &
                taking tolerance breaks
              </ThemedText>
              <View style={styles.communityStats}>
                <View
                  style={[styles.statBadge, isDark && styles.statBadgeDark]}
                >
                  <ThemedText style={styles.statText}>
                    Mindful approach
                  </ThemedText>
                </View>
                <View
                  style={[styles.statBadge, isDark && styles.statBadgeDark]}
                >
                  <ThemedText style={styles.statText}>T-breaks</ThemedText>
                </View>
              </View>
            </Pressable>

            {/* Quit Option */}
            <Pressable
              style={[
                styles.optionCard,
                isDark && styles.optionCardDark,
                styles.quitCard,
              ]}
              onPress={handleSelectQuit}
            >
              <View
                style={[styles.optionIconContainer, styles.quitIconContainer]}
              >
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={28}
                  color="#4CAF50"
                />
              </View>
              <ThemedText type="subtitle" style={styles.optionTitle}>
                Quit Completely
              </ThemedText>
              <ThemedText style={styles.optionDescription}>
                Join r/leaves - A supportive community for those wanting to quit
                cannabis entirely
              </ThemedText>
              <View style={styles.communityStats}>
                <View
                  style={[styles.statBadge, isDark && styles.statBadgeDark]}
                >
                  <ThemedText style={styles.statText}>Full sobriety</ThemedText>
                </View>
                <View
                  style={[styles.statBadge, isDark && styles.statBadgeDark]}
                >
                  <ThemedText style={styles.statText}>Recovery</ThemedText>
                </View>
              </View>
            </Pressable>
          </View>

          <ThemedText style={styles.footerNote}>
            You can always switch communities later
          </ThemedText>
        </View>
      )}

      {selectedSubreddit && (
        <View style={styles.subredditHeader}>
          <View style={styles.subredditInfo}>
            <ThemedText type="subtitle" style={styles.subredditName}>
              r/{selectedSubreddit}
            </ThemedText>
            <ThemedText style={styles.subredditDescription}>
              {selectedSubreddit === SUBREDDITS.LEAVES
                ? "Support for quitting cannabis"
                : "Responsible use and T-breaks"}
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={[styles.actionButton, isDark && styles.actionButtonDark]}
              onPress={() => {
                setSelectedSubreddit(null);
                setPosts([]);
              }}
            >
              <ThemedText style={styles.actionButtonText}>Switch</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.iconButton, isDark && styles.iconButtonDark]}
              onPress={handleRefresh}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                size={20}
                color={isDark ? "#FFFFFF" : "#333333"}
              />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  const renderPost = ({ item }: { item: RedditPost }) => (
    <RedditPostCard
      post={item}
      style={styles.postCard}
      onPress={handlePostPress}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        {error && <ThemedText style={styles.emptyText}>{error}</ThemedText>}
      </View>
    );
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "ios" ? insets.top : 0,
        },
      ]}
    >
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            enabled={!!selectedSubreddit}
          />
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <RedditPostModal
        visible={showPostModal}
        post={selectedPost}
        onClose={() => setShowPostModal(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 32,
    marginBottom: 8,
  },
  screenDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 24,
    fontFamily: FontFamily.regular,
  },
  communitySelection: {
    marginBottom: 0,
  },
  selectionTitle: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  selectionDescription: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 40,
    textAlign: "center",
    fontFamily: FontFamily.regular,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E6E8EB",
    backgroundColor: "#F6F7F9",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  optionCardDark: {
    backgroundColor: "#181A1B",
    borderColor: "#2A2A2A",
  },
  moderateCard: {
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  quitCard: {
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moderateIconContainer: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
  },
  quitIconContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  optionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  communityStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statBadgeDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  statText: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    opacity: 0.8,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.4,
    marginTop: 5,
    fontFamily: FontFamily.regular,
  },
  subredditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  subredditInfo: {
    flex: 1,
  },
  subredditName: {
    fontSize: 20,
    marginBottom: 4,
  },
  subredditDescription: {
    fontSize: 14,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  iconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 200,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    fontFamily: FontFamily.regular,
  },
});

import RedditPostCard from "@/components/RedditPostCard";
import RedditPostDetail from "@/components/RedditPostDetail";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { redditApi, RedditListing, RedditPost } from "@/services/redditApi";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type SortType = "hot" | "new" | "top" | "rising";

export default function RedditTab() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>("hot");
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "tabIconDefault");

  const fetchPosts = useCallback(
    async (isRefresh = false, loadMore = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
          setError(null);
        } else if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        const currentAfter =
          isRefresh || !loadMore ? undefined : after || undefined;
        const response: RedditListing = await redditApi.getLeavesPosts(
          sortType,
          25,
          currentAfter,
        );

        // Filter out pinned/stickied posts for a cleaner feed
        const newPosts = response.data.children
          .map((child) => child.data)
          .filter((post) => !post.stickied);

        if (isRefresh || !loadMore) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setAfter(response.data.after);
        setError(null);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Unable to load posts. Please check your connection.");
        if (!loadMore && !isRefresh) {
          setPosts([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [sortType, after],
  );

  useEffect(() => {
    fetchPosts();
  }, [sortType, fetchPosts]);

  const handleRefresh = () => {
    setAfter(null);
    fetchPosts(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && after && posts.length > 0) {
      fetchPosts(false, true);
    }
  };

  const handleSortChange = (newSort: SortType) => {
    if (newSort !== sortType) {
      setSortType(newSort);
      setAfter(null);
      setPosts([]);
    }
  };

  const handlePostPress = (post: RedditPost) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleClosePostDetail = () => {
    setShowPostDetail(false);
    setSelectedPost(null);
  };

  const renderSortButton = (sort: SortType, label: string, emoji: string) => {
    const isActive = sortType === sort;
    return (
      <Pressable
        key={sort}
        onPress={() => handleSortChange(sort)}
        style={({ pressed }) => [
          styles.sortButton,
          isActive && [
            styles.activeSortButton,
            { backgroundColor: tintColor + "15" },
          ],
          pressed && styles.pressedSortButton,
        ]}
      >
        <ThemedText
          style={[
            styles.sortButtonText,
            { color: isActive ? tintColor : mutedColor },
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderPost = ({ item }: { item: RedditPost }) => (
    <RedditPostCard post={item} onPress={() => handlePostPress(item)} />
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.titleSection}>
        <ThemedText style={[styles.subredditTitle, { color: textColor }]}>
          r/leaves
        </ThemedText>
        <ThemedText style={[styles.description, { color: mutedColor }]}>
          A supportive community for cannabis recovery
        </ThemedText>
      </View>

      <View style={styles.sortSection}>
        <View style={styles.sortContainer}>
          {renderSortButton("hot", "Hot", "🔥")}
          {renderSortButton("new", "New", "✨")}
          {renderSortButton("top", "Top", "⭐")}
          {renderSortButton("rising", "Rising", "📈")}
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={tintColor} />
        <ThemedText style={[styles.loadingText, { color: mutedColor }]}>
          Loading more posts...
        </ThemedText>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: tintColor + "20" }]}>
        <ThemedText style={styles.emptyIconText}>🍃</ThemedText>
      </View>
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
        {error ? "Connection Error" : "No Posts Available"}
      </ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: mutedColor }]}>
        {error || "Try refreshing to load the latest posts from r/leaves"}
      </ThemedText>
      {error && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tintColor }]}
          onPress={() => fetchPosts()}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.retryButtonText}>🔄 Try Again</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor }]}>
        <View
          style={[styles.loadingIcon, { backgroundColor: tintColor + "20" }]}
        >
          <ActivityIndicator size="large" color={tintColor} />
        </View>
        <ThemedText style={[styles.loadingTitle, { color: textColor }]}>
          Loading r/leaves
        </ThemedText>
        <ThemedText style={[styles.loadingSubtitle, { color: mutedColor }]}>
          Fetching the latest posts from the community...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContainer : styles.contentContainer
        }
      />

      {/* Post Detail Modal */}
      <Modal
        visible={showPostDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClosePostDetail}
      >
        {selectedPost && (
          <RedditPostDetail
            post={selectedPost}
            onClose={handleClosePostDetail}
          />
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  subredditTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "400",
  },
  sortSection: {
    alignItems: "center",
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 25,
    padding: 4,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeSortButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressedSortButton: {
    transform: [{ scale: 0.95 }],
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footerLoader: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

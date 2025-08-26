import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Mock data for demonstration
const mockConversations = [
  {
    id: "1",
    name: "Sarah M.",
    avatar: "🌻",
    lastMessage:
      "Thanks for the support today! Really helped me get through a tough moment.",
    timestamp: "5m ago",
    online: true,
    unread: 2,
  },
  {
    id: "2",
    name: "Recovery Group",
    avatar: "🌱",
    lastMessage:
      "Weekly check-in starts in 30 mins. Join us for group support!",
    timestamp: "15m ago",
    online: false,
    unread: 0,
    isGroup: true,
  },
  {
    id: "3",
    name: "Alex R.",
    avatar: "💪",
    lastMessage:
      "Day 90 complete! 🎉 The journey continues, one day at a time.",
    timestamp: "1h ago",
    online: true,
    unread: 1,
  },
  {
    id: "4",
    name: "Daily Motivation",
    avatar: "⭐",
    lastMessage: 'Your daily affirmation: "I am stronger than my cravings"',
    timestamp: "2h ago",
    online: false,
    unread: 0,
    isGroup: true,
  },
  {
    id: "5",
    name: "Mike T.",
    avatar: "🧘",
    lastMessage: "Meditation session tomorrow at 7am EST. All welcome!",
    timestamp: "3h ago",
    online: false,
    unread: 0,
  },
  {
    id: "6",
    name: "Crisis Support",
    avatar: "🆘",
    lastMessage:
      "Remember: You are not alone. Reach out anytime, day or night.",
    timestamp: "5h ago",
    online: true,
    unread: 0,
    isGroup: true,
  },
  {
    id: "7",
    name: "Emma K.",
    avatar: "🌟",
    lastMessage:
      "Hit my 30 day milestone! Thank you all for the incredible support.",
    timestamp: "6h ago",
    online: false,
    unread: 0,
  },
  {
    id: "8",
    name: "Accountability Partners",
    avatar: "🤝",
    lastMessage: "Daily check-ins are so helpful. Who wants to be my buddy?",
    timestamp: "8h ago",
    online: false,
    unread: 3,
    isGroup: true,
  },
];

const quickActions = [
  { id: "1", title: "Find Support", emoji: "🤝", color: "#6366f1" },
  { id: "2", title: "Group Chat", emoji: "👥", color: "#10b981" },
  { id: "3", title: "Crisis Help", emoji: "🆘", color: "#ef4444" },
  { id: "4", title: "Share Progress", emoji: "📈", color: "#f59e0b" },
];

export default function CommunityTab() {
  const [activeTab, setActiveTab] = useState<"messages" | "groups">("messages");

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "tabIconDefault");

  const handleConversationPress = (
    conversation: (typeof mockConversations)[0],
  ) => {
    Alert.alert(
      conversation.isGroup ? "Group Chat" : "Private Message",
      `Opening conversation with ${conversation.name}.\n\nLast message: "${conversation.lastMessage}"\n\n(This is dummy data for UI reference)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Chat",
          onPress: () => console.log("Opening chat with", conversation.name),
        },
      ],
    );
  };

  const handleQuickActionPress = (action: (typeof quickActions)[0]) => {
    Alert.alert(
      action.title,
      `${action.emoji} ${action.title} feature activated!\n\n(This is dummy functionality for UI reference)`,
      [{ text: "OK" }],
    );
  };

  const renderConversation = ({
    item,
  }: {
    item: (typeof mockConversations)[0];
  }) => (
    <Pressable
      onPress={() => handleConversationPress(item)}
      style={({ pressed }) => [
        styles.conversationItem,
        { backgroundColor: pressed ? mutedColor + "10" : "transparent" },
      ]}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: tintColor + "20" }]}>
          <ThemedText style={styles.avatarText}>{item.avatar}</ThemedText>
        </View>
        {item.online && (
          <View
            style={[styles.onlineIndicator, { backgroundColor: "#10b981" }]}
          />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText
            style={[styles.conversationName, { color: textColor }]}
            numberOfLines={1}
          >
            {item.name}
            {item.isGroup && " 👥"}
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: mutedColor }]}>
            {item.timestamp}
          </ThemedText>
        </View>

        <ThemedText
          style={[styles.lastMessage, { color: mutedColor }]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </ThemedText>
      </View>

      {item.unread > 0 && (
        <View style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
          <ThemedText style={styles.unreadText}>{item.unread}</ThemedText>
        </View>
      )}
    </Pressable>
  );

  const renderQuickAction = (action: (typeof quickActions)[0]) => (
    <TouchableOpacity
      key={action.id}
      onPress={() => handleQuickActionPress(action)}
      style={[styles.quickAction, { backgroundColor: action.color + "15" }]}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <ThemedText style={styles.quickActionEmoji}>{action.emoji}</ThemedText>
      </View>
      <ThemedText style={[styles.quickActionTitle, { color: action.color }]}>
        {action.title}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderTabButton = (
    tab: "messages" | "groups",
    title: string,
    emoji: string,
  ) => {
    const isActive = activeTab === tab;
    return (
      <Pressable
        key={tab}
        onPress={() => setActiveTab(tab)}
        style={({ pressed }) => [
          styles.tabButton,
          isActive && styles.activeTabButton,
          pressed && styles.pressedTabButton,
          { borderColor: isActive ? tintColor : mutedColor + "40" },
        ]}
      >
        {isActive && (
          <LinearGradient
            colors={[tintColor, tintColor + "dd"]}
            style={styles.tabButtonGradient}
          />
        )}
        <ThemedText
          style={[
            styles.tabButtonText,
            { color: isActive ? "white" : textColor },
          ]}
        >
          {emoji} {title}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <LinearGradient
            colors={[tintColor, tintColor + "cc"]}
            style={styles.titleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={styles.title}>💬 Community</ThemedText>
          </LinearGradient>
          <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
            Connect with others on their recovery journey
          </ThemedText>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Quick Actions
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <View style={styles.tabContainer}>
            {renderTabButton("messages", "Messages", "💬")}
            {renderTabButton("groups", "Groups", "👥")}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "messages" ? (
          <FlatList
            data={mockConversations.filter((c) => !c.isGroup)}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conversationsList}
          />
        ) : (
          <FlatList
            data={mockConversations.filter((c) => c.isGroup)}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conversationsList}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Start New Conversation",
            "Choose how you'd like to connect:\n\n• Find someone to chat with\n• Join a support group\n• Create a new group\n\n(This is dummy functionality for UI reference)",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Find People",
                onPress: () => console.log("Find people pressed"),
              },
              {
                text: "Join Group",
                onPress: () => console.log("Join group pressed"),
              },
            ],
          )
        }
        style={[styles.floatingActionButton, { backgroundColor: tintColor }]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[tintColor, tintColor + "dd"]}
          style={styles.fabGradient}
        />
        <ThemedText style={styles.fabText}>💬</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 18,
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  quickAction: {
    width: (screenWidth - 64) / 2,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionEmoji: {
    fontSize: 20,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  tabSelector: {
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  activeTabButton: {
    borderWidth: 0,
  },
  pressedTabButton: {
    transform: [{ scale: 0.95 }],
  },
  tabButtonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  conversationsList: {
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  conversationContent: {
    flex: 1,
    marginLeft: 16,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "500",
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  floatingActionButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
  fabGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fabText: {
    fontSize: 24,
    color: "white",
  },
});

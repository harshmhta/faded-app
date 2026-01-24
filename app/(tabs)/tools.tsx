import { AIPreviewModal } from "@/components/AIPreviewModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  BubbleChatIcon,
  Call02Icon,
  ClockIcon,
  CustomerSupportIcon,
  Delete02Icon,
  FloppyDiskIcon,
  Message01Icon,
  MoreVerticalIcon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Clipboard,
  FlatList,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  Animated as RNAnimated,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  KeyboardAwareScrollView,
  useKeyboardHandler,
} from "react-native-keyboard-controller";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
  isRetrying?: boolean;
}

interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
  timestamp: Date;
  isActive?: boolean;
}

interface PulsatingIndicatorProps {
  color: string;
}

function PulsatingIndicator({ color }: PulsatingIndicatorProps) {
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const opacityAnim = useRef(new RNAnimated.Value(0.15)).current;

  useEffect(() => {
    const pulse = () => {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.parallel([
            RNAnimated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(opacityAnim, {
              toValue: 0.4,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          RNAnimated.parallel([
            RNAnimated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            RNAnimated.timing(opacityAnim, {
              toValue: 0.15,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };

    pulse();
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={styles.indicatorContainer}>
      {/* Glow effect */}
      <RNAnimated.View
        style={[
          styles.glowEffect,
          {
            backgroundColor: color,
            opacity: opacityAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      {/* Main dot */}
      <View
        style={[
          styles.pulsatingIndicator,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showAIPopupModal, setShowAIPopupModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [showTimestamp, setShowTimestamp] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardAwareScrollRef = useRef<ScrollView>(null);
  const typingDotsAnimation = useSharedValue(0);
  const appStateRef = useRef(AppState.currentState);

  // Keyboard animation with spring
  const keyboardHeight = useSharedValue(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Animated styles - must be at component level to avoid hooks order issues
  const typingDotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(typingDotsAnimation.value, [0, 1], [0.3, 1]),
    transform: [
      {
        scale: interpolate(typingDotsAnimation.value, [0, 1], [0.8, 1.2]),
      },
    ],
  }));

  const scrollToBottom = () => {
    setTimeout(() => {
      keyboardAwareScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useKeyboardHandler({
    onStart: (e) => {
      "worklet";
      // Immediate response for keyboard opening, spring for closing
      if (e.height > 0) {
        keyboardHeight.value = withSpring(e.height, {
          damping: 80,
          stiffness: 800,
        });
        runOnJS(setIsKeyboardVisible)(true);
        runOnJS(scrollToBottom)();
      } else {
        keyboardHeight.value = withSpring(e.height, {
          damping: 50,
          stiffness: 400,
        });
        runOnJS(setIsKeyboardVisible)(false);
      }
    },
    onMove: (e) => {
      "worklet";
      // Follow keyboard movement immediately during interactive dismissal
      keyboardHeight.value = e.height;
    },
    onEnd: (e) => {
      "worklet";
      // Smooth spring animation when keyboard settles
      keyboardHeight.value = withSpring(e.height, {
        damping: 50,
        stiffness: 400,
      });
      if (e.height === 0) {
        runOnJS(setIsKeyboardVisible)(false);
      }
    },
  });

  // Animated style for input container with smooth spring animation
  const inputAnimatedStyle = useAnimatedStyle(() => {
    const safeBottomPadding = Math.max(insets.bottom, 10) + 45;
    const adjustedHeight = Math.max(
      0,
      keyboardHeight.value - safeBottomPadding,
    );
    return {
      transform: [{ translateY: -adjustedHeight }],
    };
  });

  // Handle dismissing keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setSelectedMessage(null);
    setShowTimestamp(null);
    setShowMenu(false);
  };

  // Utility functions
  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const copyMessage = async (text: string) => {
    await Clipboard.setString(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setSelectedMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const clearAllMessages = () => {
    Alert.alert(
      "Clear Chat",
      "This will clear the current conversation without saving. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setMessages([]);
            setCurrentSessionId(null);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ],
    );
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appStateRef.current.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      // App is going to background, save current session
      if (currentSessionId && messages.length > 0) {
        saveCurrentSession();
      }
    }
    appStateRef.current = nextAppState;
  };

  const loadChatSessions = async () => {
    try {
      const sessionsJson = await AsyncStorage.getItem("chatSessions");
      if (sessionsJson) {
        const sessions = JSON.parse(sessionsJson);
        setChatSessions(
          sessions.map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp),
            messages: s.messages.map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          })),
        );
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const saveCurrentSession = async () => {
    if (!messages.length) return;

    try {
      const sessionId = currentSessionId || Date.now().toString();
      const title =
        messages[0]?.text.substring(0, 50) +
        (messages[0]?.text.length > 50 ? "..." : "");

      const newSession: ChatSession = {
        id: sessionId,
        messages,
        title,
        timestamp: new Date(),
        isActive: true,
      };

      const updatedSessions = chatSessions.filter((s) => s.id !== sessionId);
      updatedSessions.unshift(newSession);

      // Keep only last 50 sessions
      const sessionsToSave = updatedSessions.slice(0, 50);

      await AsyncStorage.setItem(
        "chatSessions",
        JSON.stringify(sessionsToSave),
      );
      setChatSessions(sessionsToSave);
      setCurrentSessionId(sessionId);
    } catch (error) {
      console.error("Error saving chat session:", error);
    }
  };

  const endAndSaveChat = () => {
    Alert.alert(
      "Save & Exit Chat",
      "This will save the current conversation and start a new one. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save & Exit",
          style: "default",
          onPress: async () => {
            await saveCurrentSession();
            setMessages([]);
            setCurrentSessionId(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const loadChatSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowChatHistory(false);
    scrollToBottom();
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      const updatedSessions = chatSessions.filter((s) => s.id !== sessionId);
      await AsyncStorage.setItem(
        "chatSessions",
        JSON.stringify(updatedSessions),
      );
      setChatSessions(updatedSessions);

      if (currentSessionId === sessionId) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  const retryMessage = async (messageId: string, originalText: string) => {
    // Mark message as retrying
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isRetrying: true } : msg,
      ),
    );

    // Remove the error message and retry
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

    // Resend the message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: originalText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await sendMessageToAPI(originalText);
  };

  useEffect(() => {
    // Check if user has seen the AI popup modal before
    const checkAIPopupStatus = async () => {
      try {
        const hasSeenPopup = await AsyncStorage.getItem("hasSeenAIPopup");
        if (!hasSeenPopup) {
          setShowAIPopupModal(true);
        }
      } catch (error) {
        console.error("Error checking AI popup status:", error);
      }
    };

    checkAIPopupStatus();
    loadChatSessions();

    // Handle app state changes for auto-save
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      // Save current session when component unmounts
      if (currentSessionId && messages.length > 0) {
        saveCurrentSession();
      }
    };
  }, []);

  useEffect(() => {
    // Auto-save when messages change
    if (currentSessionId && messages.length > 0) {
      const timer = setTimeout(() => {
        saveCurrentSession();
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const messageText = inputText.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    scrollToBottom();

    await sendMessageToAPI(messageText);
  };

  const sendMessageToAPI = async (messageText: string) => {
    setIsLoading(true);
    setIsTyping(true);

    // Start typing animation
    typingDotsAnimation.value = withSequence(
      withTiming(1, { duration: 500 }),
      withTiming(0, { duration: 500 }),
      withTiming(1, { duration: 500 }),
    );

    try {
      const response = await fetch(
        "https://ywvxpmiddklmsm5td5lgel7u.agents.do-ai.run/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_DO_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: messageText,
              },
            ],
          }),
        },
      );

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.choices?.[0]?.message?.content ||
          "Sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
        isError: !data.choices?.[0]?.message?.content,
      };

      setMessages((prev) => [...prev, aiMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header with Menu and Action buttons */}
        <View style={[styles.header, { paddingTop: 12 }]}>
          <View style={styles.headerLeft}>
            <Pressable
              style={[styles.menuButton, isDark && styles.menuButtonDark]}
              onPress={() => setShowMenu(!showMenu)}
            >
              <HugeiconsIcon
                icon={MoreVerticalIcon}
                size={24}
                color={isDark ? "#FFFFFF" : "#000000"}
              />
            </Pressable>

            {/* Dropdown Menu */}
            {showMenu && (
              <View
                style={[styles.dropdownMenu, isDark && styles.dropdownMenuDark]}
              >
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowChatHistory(true);
                  }}
                >
                  <HugeiconsIcon
                    icon={ClockIcon}
                    size={20}
                    color={isDark ? "#FFFFFF" : "#007AFF"}
                  />
                  <ThemedText
                    style={[
                      styles.dropdownItemText,
                      isDark && styles.dropdownItemTextDark,
                    ]}
                  >
                    Chat History
                  </ThemedText>
                </Pressable>

                <View
                  style={[
                    styles.dropdownDivider,
                    isDark && styles.dropdownDividerDark,
                  ]}
                />

                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowMenu(false);
                    setShowCrisisSupport(true);
                  }}
                >
                  <HugeiconsIcon
                    icon={CustomerSupportIcon}
                    size={20}
                    color={isDark ? "#4CAF50" : "#388E3C"}
                  />
                  <ThemedText
                    style={[
                      styles.dropdownItemText,
                      isDark && styles.dropdownItemTextDark,
                    ]}
                  >
                    Crisis Support
                  </ThemedText>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            {messages.length > 0 && (
              <>
                <Pressable
                  style={[styles.iconButton, isDark && styles.iconButtonDark]}
                  onPress={clearAllMessages}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={22}
                    color={isDark ? "#FF6B6B" : "#FF3B30"}
                  />
                </Pressable>

                <Pressable
                  style={[styles.iconButton, isDark && styles.iconButtonDark]}
                  onPress={endAndSaveChat}
                >
                  <HugeiconsIcon
                    icon={FloppyDiskIcon}
                    size={22}
                    color={isDark ? "#FFFFFF" : "#388E3C"}
                  />
                </Pressable>
              </>
            )}
          </View>
        </View>

        <KeyboardAwareScrollView
          ref={keyboardAwareScrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
          extraKeyboardSpace={20}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <HugeiconsIcon
                  icon={BubbleChatIcon}
                  size={48}
                  color={isDark ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.emptyStateTitle}>
                Start a conversation with Luma
              </ThemedText>
              <ThemedText style={styles.emptyText}>
                Your AI companion is here to support you.
                Try asking about:
              </ThemedText>

              <View style={styles.conversationStarters}>
                {[
                  "How can I manage cravings today?",
                  "I'm feeling stressed, what should I do?",
                  "Help me set a goal for this week",
                  "What are some healthy coping strategies?",
                ].map((starter, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.starterButton,
                      isDark && styles.starterButtonDark,
                      isLoading && styles.starterButtonDisabled,
                    ]}
                    onPress={async () => {
                      if (isLoading) return; // Prevent multiple requests

                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

                      // Create and add user message immediately
                      const userMessage: Message = {
                        id: Date.now().toString(),
                        text: starter,
                        isUser: true,
                        timestamp: new Date(),
                      };

                      setMessages((prev) => [...prev, userMessage]);
                      scrollToBottom();

                      // Send to API
                      await sendMessageToAPI(starter);
                    }}
                    disabled={isLoading}
                  >
                    <ThemedText
                      style={[
                        styles.starterText,
                        isDark && styles.starterTextDark,
                      ]}
                    >
                      {starter}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.privacyContainer}>
                <View style={styles.privacyContent}>
                  <HugeiconsIcon
                    icon={SecurityLockIcon}
                    size={24}
                    color={isDark ? "#8E8E93" : "#6C6C70"}
                    style={styles.privacyIcon}
                  />
                  <ThemedText style={styles.privacyText}>
                    Chat saved only on device.{"\n"}Your data is not used to train AI.
                  </ThemedText>
                </View>
              </View>
            </View>
          )}

          {messages.map((message) => (
            <Pressable
              key={message.id}
              onPress={() => {
                setShowTimestamp(
                  showTimestamp === message.id ? null : message.id,
                );
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onLongPress={() => {
                setSelectedMessage(message.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                const options = ["Copy"];
                if (!message.isUser) {
                  if (message.isError) {
                    options.push("Retry");
                  }
                  options.push("Delete");
                }

                Alert.alert(
                  "Message Options",
                  message.text.length > 50
                    ? message.text.substring(0, 50) + "..."
                    : message.text,
                  [
                    ...options.map((option) => ({
                      text: option,
                      onPress: () => {
                        switch (option) {
                          case "Copy":
                            copyMessage(message.text);
                            break;
                          case "Retry":
                            // Find the user message that triggered this response
                            const userMessageIndex =
                              messages.findIndex((m) => m.id === message.id) -
                              1;
                            const userMessage = messages[userMessageIndex];
                            if (userMessage && userMessage.isUser) {
                              retryMessage(message.id, userMessage.text);
                            }
                            break;
                          case "Delete":
                            deleteMessage(message.id);
                            break;
                        }
                        setSelectedMessage(null);
                      },
                    })),
                    {
                      text: "Cancel",
                      style: "cancel",
                      onPress: () => setSelectedMessage(null),
                    },
                  ],
                );
              }}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage,
                selectedMessage === message.id && styles.selectedMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                <View
                  style={[
                    styles.indicator,
                    message.isUser
                      ? styles.userIndicator
                      : message.isError
                        ? styles.errorIndicator
                        : styles.aiIndicator,
                  ]}
                />
                <ThemedText style={styles.senderLabel}>
                  {message.isUser ? "You" : "Luma"}
                </ThemedText>
                {showTimestamp === message.id && (
                  <ThemedText style={styles.timestamp}>
                    {getRelativeTime(message.timestamp)}
                  </ThemedText>
                )}
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.isUser
                    ? styles.userBubble
                    : message.isError
                      ? [
                          styles.errorBubble,
                          { backgroundColor: isDark ? "#3A1A1A" : "#FFF0F0" },
                        ]
                      : { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.isUser
                      ? styles.userMessageText
                      : message.isError
                        ? [
                            styles.errorMessageText,
                            { color: isDark ? "#FF6B6B" : "#D32F2F" },
                          ]
                        : { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {message.text}
                </ThemedText>
                {message.isError && (
                  <ThemedText
                    style={[
                      styles.errorHint,
                      { color: isDark ? "#FF9999" : "#B71C1C" },
                    ]}
                  >
                    Tap and hold to retry
                  </ThemedText>
                )}
              </View>
            </Pressable>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.messageHeader}>
                <View style={[styles.indicator, styles.aiIndicator]} />
                <ThemedText style={styles.senderLabel}>Luma</ThemedText>
              </View>
              <View
                style={[
                  styles.loadingBubble,
                  { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                ]}
              >
                <View style={styles.typingIndicator}>
                  {[0, 1, 2].map((index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.typingDot,
                        {
                          backgroundColor: isDark ? "#8E8E93" : "#666",
                        },
                        typingDotAnimatedStyle,
                      ]}
                    />
                  ))}
                </View>
                <ThemedText
                  style={[
                    styles.loadingText,
                    { color: isDark ? "#8E8E93" : "#666" },
                  ]}
                >
                  {isTyping ? "Typing..." : "Thinking..."}
                </ThemedText>
              </View>
            </View>
          )}
        </KeyboardAwareScrollView>

        {/* Input Area */}
        <Animated.View
          style={[
            styles.inputContainer,
            { paddingBottom: Math.max(insets.bottom, 10) + 45 },
            inputAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              isDark ? styles.inputWrapperDark : styles.inputWrapperLight,
            ]}
          >
            <BlurView
              tint={isDark ? "dark" : "light"}
              intensity={24}
              style={styles.inputBlur}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? [
                      "rgba(255,255,255,0.05)",
                      "rgba(255,255,255,0.015)",
                      "rgba(255,255,255,0)",
                    ]
                  : ["rgba(0,0,0,0.03)", "rgba(0,0,0,0.015)", "rgba(0,0,0,0)"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inputGradient}
            />
            <LinearGradient
              pointerEvents="none"
              colors={
                isDark
                  ? ["rgba(0,0,0,0)", "rgba(0,0,0,0.14)"]
                  : ["rgba(0,0,0,0)", "rgba(0,0,0,0.04)"]
              }
              start={{ x: 0.3, y: 0.0 }}
              end={{ x: 0.3, y: 1.0 }}
              style={styles.inputBottomFade}
            />
            <TextInput
              style={[
                styles.textInput,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything..."
              placeholderTextColor={isDark ? "#8E8E93" : "#999"}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            {inputText.trim() && (
              <Pressable
                style={[
                  styles.sendButton,
                  isLoading && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={isLoading}
              >
                <ThemedText style={styles.sendText}>→</ThemedText>
              </Pressable>
            )}
          </View>
        </Animated.View>

        <AIPreviewModal
          visible={showAIPopupModal}
          onClose={async () => {
            setShowAIPopupModal(false);
            try {
              await AsyncStorage.setItem("hasSeenAIPopup", "true");
            } catch (error) {
              console.error("Error saving AI popup status:", error);
            }
          }}
        />

        {/* Chat History Modal */}
        <Modal
          visible={showChatHistory}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowChatHistory(false)}
        >
          <ThemedView
            style={[styles.modalContainer, isDark && styles.modalContainerDark]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && styles.modalHeaderDark,
                { paddingTop: 15 },
              ]}
            >
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Chat History
              </ThemedText>
              <Pressable
                onPress={() => setShowChatHistory(false)}
                style={[
                  styles.modalCloseButton,
                  isDark && styles.modalCloseButtonDark,
                ]}
              >
                <ThemedText style={styles.modalCloseText}>✕</ThemedText>
              </Pressable>
            </View>

            {chatSessions.length === 0 ? (
              <View style={styles.emptyHistoryContainer}>
                <ThemedText style={styles.emptyHistoryText}>
                  No saved conversations yet
                </ThemedText>
                <ThemedText style={styles.emptyHistorySubtext}>
                  Your conversations will appear here when you save them
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={chatSessions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.chatSessionItem,
                      isDark && styles.chatSessionItemDark,
                    ]}
                    onPress={() => loadChatSession(item)}
                    onLongPress={() => {
                      Alert.alert(
                        "Delete Chat",
                        "Are you sure you want to delete this conversation?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => deleteChatSession(item.id),
                          },
                        ],
                      );
                    }}
                  >
                    <View style={styles.chatSessionContent}>
                      <ThemedText style={styles.chatSessionTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={styles.chatSessionDate}>
                        {getRelativeTime(item.timestamp)} •{" "}
                        {item.messages.length} messages
                      </ThemedText>
                    </View>
                    {item.id === currentSessionId && (
                      <View style={styles.activeIndicator} />
                    )}
                  </Pressable>
                )}
                contentContainerStyle={styles.historyListContent}
              />
            )}
          </ThemedView>
        </Modal>

        {/* Crisis Support Modal */}
        <Modal
          visible={showCrisisSupport}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCrisisSupport(false)}
        >
          <ThemedView
            style={[styles.modalContainer, isDark && styles.modalContainerDark]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && styles.modalHeaderDark,
                { paddingTop: 15 },
              ]}
            >
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Important Information
              </ThemedText>
              <Pressable
                onPress={() => setShowCrisisSupport(false)}
                style={[
                  styles.modalCloseButton,
                  isDark && styles.modalCloseButtonDark,
                ]}
              >
                <ThemedText style={styles.modalCloseText}>✕</ThemedText>
              </Pressable>
            </View>

            <ScrollView
              style={styles.crisisSupportContent}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.disclaimerSection,
                  isDark && styles.disclaimerSectionDark,
                ]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.disclaimerTitle}
                >
                  About Luma
                </ThemedText>
                <ThemedText style={styles.disclaimerText}>
                  Luma is an AI companion designed to support you on your
                  journey. While Luma can provide helpful guidance and coping
                  strategies, it's important to understand:
                </ThemedText>

                <View style={styles.disclaimerPoints}>
                  <View style={styles.disclaimerPoint}>
                    <ThemedText style={styles.disclaimerBullet}>•</ThemedText>
                    <ThemedText style={styles.disclaimerPointText}>
                      Luma is not a replacement for professional medical advice,
                      diagnosis, or treatment
                    </ThemedText>
                  </View>
                  <View style={styles.disclaimerPoint}>
                    <ThemedText style={styles.disclaimerBullet}>•</ThemedText>
                    <ThemedText style={styles.disclaimerPointText}>
                      Always seek the advice of qualified health providers with
                      any questions you may have
                    </ThemedText>
                  </View>
                  <View style={styles.disclaimerPoint}>
                    <ThemedText style={styles.disclaimerBullet}>•</ThemedText>
                    <ThemedText style={styles.disclaimerPointText}>
                      In case of emergency, please contact emergency services
                      immediately
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.crisisCard,
                  {
                    borderColor: isDark ? "#4CAF50" : "#E8F5E8",
                    backgroundColor: isDark ? "#1A2A1A" : "#F8FFF8",
                  },
                ]}
              >
                <View style={styles.crisisHeaderRow}>
                  <View style={styles.crisisHeaderLeft}>
                    <PulsatingIndicator color="#4CAF50" />
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.crisisCardTitle}
                    >
                      Crisis Support Available
                    </ThemedText>
                  </View>
                  <View style={styles.crisisSubtitleBadge}>
                    <ThemedText style={styles.crisisSubtitle}>24/7</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.crisisCardContent}>
                  If you're having thoughts of self-harm, help is available
                  right now.
                </ThemedText>
                <View style={styles.crisisButtons}>
                  <Pressable
                    style={[
                      styles.crisisButton,
                      isDark && styles.crisisButtonDark,
                    ]}
                    onPress={() => Linking.openURL("tel:988")}
                  >
                    <View style={styles.crisisButtonContent}>
                      <HugeiconsIcon
                        icon={Call02Icon}
                        size={16}
                        color="#FFFFFF"
                      />
                      <ThemedText
                        style={[
                          styles.crisisButtonText,
                          isDark && styles.crisisButtonTextDark,
                        ]}
                      >
                        Call for help
                      </ThemedText>
                    </View>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.crisisButton,
                      isDark && styles.crisisButtonDark,
                    ]}
                    onPress={() => Linking.openURL("sms:988")}
                  >
                    <View style={styles.crisisButtonContent}>
                      <HugeiconsIcon
                        icon={Message01Icon}
                        size={16}
                        color="#FFFFFF"
                      />
                      <ThemedText
                        style={[
                          styles.crisisButtonText,
                          isDark && styles.crisisButtonTextDark,
                        ]}
                      >
                        Text for help
                      </ThemedText>
                    </View>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </ThemedView>
        </Modal>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 22,
    marginBottom: 24,
  },
  privacyContainer: {
    marginTop: 20,
    marginBottom: 0,
    alignItems: "center",
  },
  privacyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  privacyIcon: {
    marginTop: 2,
  },
  privacyText: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 20,
    fontSize: 13,
  },
  conversationStarters: {
    width: "100%",
    gap: 12,
  },
  starterButton: {
    backgroundColor: "rgba(0, 122, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.15)",
  },
  starterButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  starterButtonDisabled: {
    opacity: 0.5,
  },
  starterText: {
    fontSize: 15,
    textAlign: "center",
    color: "#007AFF",
    fontWeight: "500",
  },
  starterTextDark: {
    color: "#FFFFFF",
  },
  messageContainer: {
    marginBottom: 8,
  },
  selectedMessage: {
    backgroundColor: "rgba(0, 122, 255, 0.05)",
    borderRadius: 12,
    padding: 8,
    marginHorizontal: -8,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginLeft: 8,
    fontWeight: "500",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  userIndicator: {
    backgroundColor: "#007AFF",
  },
  aiIndicator: {
    backgroundColor: "#FF6B35",
  },
  errorIndicator: {
    backgroundColor: "#FF3B30",
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  aiBubble: {
    // Dynamic background color handled inline
  },
  errorBubble: {
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  aiMessageText: {
    // Dynamic text color handled inline
  },
  errorMessageText: {
    fontWeight: "500",
  },
  errorHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
    opacity: 0.8,
  },
  loadingContainer: {
    marginBottom: 8,
    alignItems: "flex-start",
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: "85%",
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingTop: 10,
    paddingHorizontal: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    overflow: "hidden",
  },
  inputWrapperLight: {
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  inputWrapperDark: {
    backgroundColor: "rgba(16,16,16,0.55)",
  },
  inputBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  inputGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  inputBottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingBottom: 16,
    marginBottom: 8,
  },
  headerLeft: {
    position: "relative",
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  menuButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 48,
    left: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
    paddingVertical: 8,
  },
  dropdownMenuDark: {
    backgroundColor: "#2C2C2E",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: FontFamily.medium,
    color: "#000000",
  },
  dropdownItemTextDark: {
    color: "#FFFFFF",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginVertical: 4,
  },
  dropdownDividerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  iconButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalContainerDark: {
    backgroundColor: "#151718",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHeaderDark: {
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  modalCloseButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalCloseText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 20,
  },
  historyListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  chatSessionItem: {
    backgroundColor: "#F6F7F9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatSessionItemDark: {
    backgroundColor: "#2C2C2E",
  },
  chatSessionContent: {
    flex: 1,
  },
  chatSessionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  chatSessionDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginLeft: 12,
  },
  crisisSupportContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  disclaimerSection: {
    marginBottom: 32,
  },
  disclaimerSectionDark: {
    // Add if needed
  },
  disclaimerTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: FontFamily.bold,
  },
  disclaimerText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  disclaimerPoints: {
    gap: 12,
  },
  disclaimerPoint: {
    flexDirection: "row",
    gap: 8,
  },
  disclaimerBullet: {
    fontSize: 16,
    opacity: 0.6,
  },
  disclaimerPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },
  crisisCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  crisisHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  crisisHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  crisisCardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  crisisSubtitleBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  crisisSubtitle: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
    color: "#4CAF50",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  crisisCardContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  crisisButtons: {
    flexDirection: "row",
    gap: 12,
  },
  crisisButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  crisisButtonDark: {
    backgroundColor: "#388E3C",
  },
  crisisButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  crisisButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#FFFFFF",
  },
  crisisButtonTextDark: {
    color: "#FFFFFF",
  },
  indicatorContainer: {
    position: "relative",
    width: 14,
    height: 14,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pulsatingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 2,
  },
  glowEffect: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
});

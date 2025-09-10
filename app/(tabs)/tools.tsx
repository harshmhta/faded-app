import { AIPreviewModal } from "@/components/AIPreviewModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showAIPopupModal, setShowAIPopupModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardAwareScrollRef = useRef<ScrollView>(null);

  // Keyboard animation with spring
  const keyboardHeight = useSharedValue(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
  };

  useEffect(() => {
    // Show AI popup modal when tools page is accessed
    setShowAIPopupModal(true);

    // Send initial "Hi!" message to LLM to initiate conversation
    sendInitialMessage();
  }, []);

  const sendInitialMessage = () => {
    const initialMessage: Message = {
      id: Date.now().toString(),
      text: "Hello! I'm Luma, your AI companion. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    };

    setMessages([initialMessage]);

    // Scroll to bottom after adding AI message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    scrollToBottom();

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
                content: userMessage.text,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.choices?.[0]?.message?.content ||
          "Sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Scroll to bottom after adding AI message
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ThemedView style={[styles.container, { paddingTop: insets.top + 28 }]}>
        <ThemedText type="defaultSemiBold" style={styles.title}>
          Luma
        </ThemedText>

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
              <ThemedText style={styles.emptyText}>
                Start a conversation with Luma to get help with your thoughts
                and questions.
              </ThemedText>
            </View>
          )}

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                <View
                  style={[
                    styles.indicator,
                    message.isUser ? styles.userIndicator : styles.aiIndicator,
                  ]}
                />
                <ThemedText style={styles.senderLabel}>
                  {message.isUser ? "You" : "Luma"}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.isUser
                    ? styles.userBubble
                    : { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                ]}
              >
                <ThemedText
                  style={[
                    styles.messageText,
                    message.isUser
                      ? styles.userMessageText
                      : { color: isDark ? "#FFFFFF" : "#000000" },
                  ]}
                >
                  {message.text}
                </ThemedText>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.messageHeader}>
                <View style={styles.aiIndicator} />
                <ThemedText style={styles.senderLabel}>Luma</ThemedText>
              </View>
              <View
                style={[
                  styles.loadingBubble,
                  { backgroundColor: isDark ? "#2C2C2E" : "#F2F2F7" },
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#8E8E93" : "#666"}
                />
                <ThemedText
                  style={[
                    styles.loadingText,
                    { color: isDark ? "#8E8E93" : "#666" },
                  ]}
                >
                  Thinking...
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
          onClose={() => setShowAIPopupModal(false)}
        />
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    lineHeight: 28,
    marginBottom: 20,
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
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
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
  loadingContainer: {
    marginBottom: 16,
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
});

import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Motivational accountability messages
const ACCOUNTABILITY_MESSAGES = [
  {
    main: "This is YOU",
    sub: "The person worth fighting for",
  },
  {
    main: "Look yourself in the eyes",
    sub: "You deserve better than this moment of weakness",
  },
  {
    main: "You are stronger than this craving",
    sub: "Remember why you started this journey",
  },
  {
    main: "Your future self is counting on you",
    sub: "Don't let them down right now",
  },
  {
    main: "This feeling will pass",
    sub: "You've overcome this before, you can do it again",
  },
  {
    main: "Look at the person you're becoming",
    sub: "Every second you resist, you grow stronger",
  },
  {
    main: "You are accountable to yourself",
    sub: "Nobody else can make this choice but you",
  },
  {
    main: "The pain of discipline is temporary",
    sub: "The pain of regret lasts forever",
  },
  {
    main: "You've come too far to give up now",
    sub: "Think of all the progress you've made",
  },
  {
    main: "This is your moment of power",
    sub: "Choose who you want to be",
  },
  {
    main: "You are worth the fight",
    sub: "Look at yourself and believe it",
  },
  {
    main: "Every craving you resist makes you stronger",
    sub: "You're building your resilience right now",
  },
  {
    main: "Your body is healing",
    sub: "Don't undo the progress you've made",
  },
  {
    main: "You are not alone in this struggle",
    sub: "But right now, it's just you and your choice",
  },
  {
    main: "This moment will define your day",
    sub: "Make it count for something good",
  },
  {
    main: "Look into your own eyes",
    sub: "See the warrior within you",
  },
  {
    main: "You control your actions",
    sub: "Not the craving, not the habit - YOU",
  },
  {
    main: "Think about tomorrow's you",
    sub: "Will they thank you for this decision?",
  },
  {
    main: "You are rewriting your story",
    sub: "Make this chapter one of triumph",
  },
  {
    main: "Stay present with yourself",
    sub: "Breathe. You've got this.",
  },
];

export default function SOSMirrorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [messageIndex, setMessageIndex] = useState(0);
  const [fadeAnim, setFadeAnim] = useState(1);
  const colorScheme = useColorScheme() ?? "dark";
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Rotate messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setFadeAnim(0);
      
      // After fade out, change message and fade in
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % ACCOUNTABILITY_MESSAGES.length);
        setFadeAnim(1);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Haptic feedback on message change
  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [messageIndex]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <LinearGradient
          colors={["#FF6B6B", "#EE5A6F", "#C44569"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.permissionContent}>
          <ThemedText style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            This feature shows you your own reflection to help you stay accountable in moments of crisis.
          </ThemedText>
          <Pressable
            onPress={requestPermission}
            style={({ pressed }) => [
              styles.permissionButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const currentMessage = ACCOUNTABILITY_MESSAGES[messageIndex];

  return (
    <View style={styles.container}>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={["#1a1a1a", "#0a0a0a", "#000000"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top bar with back button */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <BlurView intensity={60} tint="dark" style={styles.topBarBlur}>
          <View style={styles.topBarContent}>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={24}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </Pressable>
            <View style={styles.topBarCenter}>
              <Animated.View 
                style={[
                  styles.pulseIndicator,
                  { transform: [{ scale: pulseAnim }] }
                ]} 
              />
              <ThemedText style={styles.topBarTitle}>Stay Strong</ThemedText>
            </View>
            <View style={styles.backButton} />
          </View>
        </BlurView>
      </View>

      {/* Content area */}
      <View style={styles.contentArea}>
        {/* Mirror container */}
        <View style={styles.mirrorContainer}>
          {/* Mirror frame with border */}
          <View style={styles.mirrorFrame}>
            <CameraView
              style={styles.mirror}
              facing="front"
              mirror={true}
            />
            {/* Mirror shine effect */}
            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mirrorShine}
              pointerEvents="none"
            />
          </View>
          
          {/* Mirror label */}
          <View style={styles.mirrorLabelContainer}>
            <BlurView intensity={60} tint="dark" style={styles.mirrorLabelBlur}>
              <ThemedText style={styles.mirrorLabel}>Look at yourself</ThemedText>
            </BlurView>
          </View>
        </View>

        {/* Message card */}
        <View style={styles.messageCardContainer}>
          <View style={styles.bentoCard}>
            <BlurView intensity={80} tint="dark" style={styles.bentoBlur}>
              <LinearGradient
                colors={["rgba(255,107,107,0.25)", "rgba(238,90,111,0.2)", "rgba(196,69,105,0.15)"]}
                style={styles.bentoGradient}
              >
                <View style={styles.messageContent}>
                  <View style={[styles.messageTextContainer, { opacity: fadeAnim }]}>
                    <ThemedText style={styles.messageMain} numberOfLines={2}>
                      {currentMessage.main}
                    </ThemedText>
                    <ThemedText style={styles.messageSub} numberOfLines={2}>
                      {currentMessage.sub}
                    </ThemedText>
                  </View>
                </View>

                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressDots}>
                    {ACCOUNTABILITY_MESSAGES.slice(0, 5).map((_, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.progressDot,
                          messageIndex % 5 === idx && styles.progressDotActive,
                        ]}
                      />
                    ))}
                  </View>
                  <ThemedText style={styles.breatheHint}>
                    Breathe • Stay Present
                  </ThemedText>
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Breathing exercise button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // TODO: Navigate to breathing exercise
            }}
            style={({ pressed }) => [
              styles.breathingButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <BlurView intensity={80} tint="dark" style={styles.breathingButtonBlur}>
              <LinearGradient
                colors={["rgba(76,175,80,0.3)", "rgba(139,195,74,0.2)"]}
                style={styles.breathingButtonGradient}
              >
                <View style={styles.breathingButtonContent}>
                  <View style={styles.breathingIconContainer}>
                    <ThemedText style={styles.breathingIcon}>🫁</ThemedText>
                  </View>
                  <View style={styles.breathingTextContainer}>
                    <ThemedText style={styles.breathingButtonTitle}>
                      Breathing Exercise
                    </ThemedText>
                    <ThemedText style={styles.breathingButtonSubtitle}>
                      Calm your mind • 2 min
                    </ThemedText>
                  </View>
                </View>
              </LinearGradient>
            </BlurView>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 350,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    minWidth: 200,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C44569",
    textAlign: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  // Top bar styles
  topBar: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  topBarBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  topBarCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "center",
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Content area
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  // Mirror styles
  mirrorContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  mirrorFrame: {
    width: Math.min(width - 80, 340),
    height: Math.min(width - 80, 340),
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  mirror: {
    width: "100%",
    height: "100%",
  },
  mirrorShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mirrorLabelContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  mirrorLabelBlur: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  mirrorLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
  },
  // Message card
  messageCardContainer: {
    width: "100%",
    maxWidth: 400,
  },
  bentoCard: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bentoBlur: {
    width: "100%",
  },
  bentoGradient: {
    padding: 24,
  },
  messageContent: {
    marginBottom: 20,
    minHeight: 80, // Fixed height to prevent jumping
  },
  messageTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  messageMain: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    lineHeight: 30,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  messageSub: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressDots: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  progressDotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  breatheHint: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.7,
  },
  // Breathing exercise button
  breathingButton: {
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(76,175,80,0.3)",
  },
  breathingButtonBlur: {
    width: "100%",
  },
  breathingButtonGradient: {
    padding: 18,
  },
  breathingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  breathingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(76,175,80,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  breathingIcon: {
    fontSize: 24,
  },
  breathingTextContainer: {
    flex: 1,
  },
  breathingButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  breathingButtonSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.7,
  },
});


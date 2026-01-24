import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  CallIcon,
  Cancel01Icon,
  Message01Icon,
  QuoteDownIcon,
  QuoteUpIcon,
  UserIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { BlurView } from "expo-blur";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Motivational accountability messages
const ACCOUNTABILITY_MESSAGES = [
  "This is YOU\nThe person worth fighting for",
  "Look yourself in the eyes\nYou deserve better than this moment",
  "You are stronger than this craving\nRemember why you started",
  "Your future self is counting on you\nDon't let them down",
  "This feeling will pass\nYou've overcome this before",
  "You are worth the fight\nLook at yourself and believe it",
  "Every craving you resist makes you stronger",
  "This moment will define your day\nMake it count",
];

export default function SOSMirrorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [messageIndex, setMessageIndex] = React.useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const breathScale = useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme() ?? "dark";
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  // Rotate messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % ACCOUNTABILITY_MESSAGES.length);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Breathing exercise animation
  useEffect(() => {
    if (!breathingActive) return;

    const runBreathingCycle = () => {
      // Inhale (4 seconds)
      setBreathingPhase('inhale');
      Animated.timing(breathScale, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (4 seconds)
        setBreathingPhase('hold');
        setTimeout(() => {
          // Exhale (4 seconds)
          setBreathingPhase('exhale');
          Animated.timing(breathScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            setBreathCount(prev => prev + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          });
        }, 4000);
      });
    };

    runBreathingCycle();
    const interval = setInterval(runBreathingCycle, 12000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const startBreathing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBreathingActive(true);
    setBreathCount(0);
  };

  const stopBreathing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBreathingActive(false);
    setBreathCount(0);
    breathScale.setValue(1);
  };


  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container} lightColor={Colors.light.background} darkColor={Colors.dark.background}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.closeButton,
              isDark && styles.closeButtonDark,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={24}
              color={isDark ? "#fff" : "#000"}
              strokeWidth={2.5}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>SOS</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <View style={[styles.permissionIconContainer, isDark ? styles.permissionIconDark : styles.permissionIconLight]}>
              <ThemedText style={styles.permissionIcon}>📸</ThemedText>
            </View>
            <ThemedText style={styles.permissionTitle}>
              Camera Permission
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
              <LinearGradient
                colors={["#F44336", "#E53935"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.permissionButtonGradient}
              >
                <ThemedText style={styles.permissionButtonText}>
                  Grant Permission
                </ThemedText>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.secondaryButton,
                isDark && styles.secondaryButtonDark,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ThemedText style={styles.secondaryButtonText}>Go Back</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    );
  }

  const currentMessage = ACCOUNTABILITY_MESSAGES[messageIndex];

  return (
    <ThemedView style={styles.container} lightColor={Colors.light.background} darkColor={Colors.dark.background}>
      {/* Header with Drag Handle */}
      <View style={[styles.modalHeader, { paddingTop: insets.top > 0 ? 10 : 20 }]}>
        <View style={styles.dragHandle} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft} />
          <ThemedText style={styles.headerTitle}>SOS
          </ThemedText>
          <Pressable
            onPress={handleClose}
            style={[styles.closeButton, isDark && styles.closeButtonDark]}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color={isDark ? "#fff" : "#000"}
              strokeWidth={2.5}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mirror Section */}
        <View
          style={[
            styles.section,
            isDark ? styles.sectionDark : styles.sectionLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={20}
            style={styles.sectionBlur}
          />

          <ThemedText style={styles.mirrorTitle}>Look at Yourself</ThemedText>

          <View style={styles.mirrorContainer}>
            <View style={styles.mirrorFrame}>
              <CameraView style={styles.mirror} facing="front" mirror={true} />
              
              {/* Decorative Quote Icons overlaid on Mirror */}
              <View style={styles.mirrorQuoteIconLeft}>
                <HugeiconsIcon
                  icon={QuoteUpIcon}
                  size={100}
                  color="#FFFFFF"
                  opacity={0.2}
                  strokeWidth={1.5}
                />
              </View>
              <View style={styles.mirrorQuoteIconRight}>
                <HugeiconsIcon
                  icon={QuoteDownIcon}
                  size={100}
                  color="#FFFFFF"
                  opacity={0.2}
                  strokeWidth={1.5}
                />
              </View>

              {/* Message overlay at bottom of mirror */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.9)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.mirrorMessageOverlay}
              >
                <Animated.View style={[styles.mirrorMessageContent, { opacity: fadeAnim }]}>
                  <ThemedText style={styles.mirrorMessageText}>
                    {currentMessage}
                  </ThemedText>
                </Animated.View>

                {/* Progress dots on mirror */}
                <View style={styles.mirrorProgressDots}>
                  {ACCOUNTABILITY_MESSAGES.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.mirrorProgressDot,
                        messageIndex === idx && styles.mirrorProgressDotActive,
                        {
                          backgroundColor:
                            messageIndex === idx
                              ? "#FFFFFF"
                              : "rgba(255,255,255,0.3)",
                        },
                      ]}
                    />
                  ))}
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Crisis Support Helpline Section - Moved right under mirror */}
        <View
          style={[
            styles.crisisHelplineCard,
            {
              borderColor: isDark ? "#4CAF50" : "#E8F5E8",
              backgroundColor: isDark ? "#1A2A1A" : "#F8FFF8",
            },
          ]}
        >
          <View style={styles.crisisHeaderRow}>
            <View style={styles.crisisHeaderLeft}>
              <View style={styles.pulsatingIndicator}>
                <View style={[styles.pulseDot, { backgroundColor: "#4CAF50" }]} />
              </View>
              <ThemedText style={styles.crisisCardTitle}>
                Crisis Support Available
              </ThemedText>
            </View>
            <View style={styles.crisisSubtitleBadge}>
              <ThemedText style={styles.crisisSubtitle}>24/7</ThemedText>
            </View>
          </View>
          <ThemedText style={styles.crisisCardContent}>
            If you're having thoughts of self-harm, help is available right now.
          </ThemedText>
          <View style={styles.crisisButtons}>
            <Pressable
              style={[
                styles.crisisButton,
                isDark && styles.crisisButtonDark,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                Linking.openURL("tel:988");
              }}
            >
              <View style={styles.crisisButtonContent}>
                <HugeiconsIcon
                  icon={CallIcon}
                  size={16}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
                <ThemedText style={styles.crisisButtonText}>
                  Call for help
                </ThemedText>
              </View>
            </Pressable>
            <Pressable
              style={[
                styles.crisisButton,
                isDark && styles.crisisButtonDark,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL("sms:988");
              }}
            >
              <View style={styles.crisisButtonContent}>
                <HugeiconsIcon
                  icon={Message01Icon}
                  size={16}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
                <ThemedText style={styles.crisisButtonText}>
                  Text for help
                </ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Breathing Exercise Section */}
        <View
          style={[
            styles.section,
            isDark ? styles.sectionDark : styles.sectionLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={20}
            style={styles.sectionBlur}
          />

          <ThemedText style={[styles.sectionTitle, { textAlign: 'center' }]}>Calm Your Mind</ThemedText>
          <View style={styles.breathingHeaderContainer}>
            <ThemedText style={[styles.sectionSubtitle, { marginBottom: 4 }]}>
              {breathingActive ? "Follow the rhythm" : "4-4-4 breathing technique"}
            </ThemedText>
            <View style={styles.breathingInstructionsContainer}>
              {!breathingActive && (
                <ThemedText style={styles.breathingInstructions}>
                  Breathe in for 4 seconds, hold for 4, breathe out for 4
                </ThemedText>
              )}
            </View>
          </View>

          <Pressable
            onPress={breathingActive ? stopBreathing : startBreathing}
            style={({ pressed }) => [
              styles.breathingContainer,
              { 
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {/* Outer decorative rings */}
            <Animated.View
              style={[
                styles.breathingRingOuter,
                {
                  transform: [{ scale: breathScale }],
                  opacity: breathingActive ? 0.3 : 0.15,
                  borderColor: isDark ? "rgba(76, 175, 80, 0.4)" : "rgba(76, 175, 80, 0.3)",
                },
              ]}
            />
            <Animated.View
              style={[
                styles.breathingRingMiddle,
                {
                  transform: [{ scale: breathScale }],
                  opacity: breathingActive ? 0.4 : 0.2,
                  borderColor: isDark ? "rgba(76, 175, 80, 0.5)" : "rgba(76, 175, 80, 0.4)",
                },
              ]}
            />
            
            {/* Main circle */}
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: breathScale }],
                },
              ]}
            >
              <LinearGradient
                colors={
                  breathingActive
                    ? isDark
                      ? ["rgba(76, 175, 80, 0.25)", "rgba(76, 175, 80, 0.15)"]
                      : ["rgba(76, 175, 80, 0.2)", "rgba(76, 175, 80, 0.12)"]
                    : isDark
                      ? ["rgba(76, 175, 80, 0.15)", "rgba(76, 175, 80, 0.08)"]
                      : ["rgba(76, 175, 80, 0.1)", "rgba(76, 175, 80, 0.05)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.breathingCircleGradient}
              >
                <View style={styles.breathingTextContainer}>
                  <ThemedText style={[
                    styles.breathingPhaseText,
                    { color: breathingActive ? "#4CAF50" : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }
                  ]}>
                    {breathingActive 
                      ? (breathingPhase === 'inhale' ? 'Breathe In' : 
                         breathingPhase === 'hold' ? 'Hold' : 'Breathe Out')
                      : 'Tap to Begin'}
                  </ThemedText>
                  {breathingActive && (
                    <ThemedText style={styles.stopHint}>
                      Tap to stop
                    </ThemedText>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          </Pressable>
        </View>

        {/* Coping Checklist */}
        <View
          style={[
            styles.section,
            isDark ? styles.sectionDark : styles.sectionLight,
          ]}
        >
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={20}
            style={styles.sectionBlur}
          />

          <ThemedText style={styles.sectionTitle}>Ride the Wave</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { marginBottom: 16 }]}>
            This urge will pass. Try these steps:
          </ThemedText>

          <View style={styles.copingList}>
            {[
              "Drink a glass of water",
              "Take 5 deep breaths",
              "Call a trusted friend",
              "Go for a short walk",
              "Wait 10 more minutes",
            ].map((item, idx) => (
              <View key={idx} style={styles.copingItem}>
                <View style={[
                  styles.copingCheckbox,
                  isDark ? styles.copingCheckboxDark : styles.copingCheckboxLight
                ]}>
                  <ThemedText style={styles.copingNumber}>{idx + 1}</ThemedText>
                </View>
                <ThemedText style={styles.copingText}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.15)",
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "rgba(128, 128, 128, 0.3)",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    width: 36,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128, 128, 128, 0.12)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  headerRight: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionLight: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionDark: {
    backgroundColor: "rgba(16,16,16,0.6)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  sectionBlur: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginBottom: 16,
  },
  crisisDescription: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    opacity: 0.7,
  },
  mirrorTitle: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 24,
    textAlign: "center",
  },
  mirrorSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    marginBottom: 20,
    opacity: 0.6,
    textAlign: "center",
  },
  mirrorContainer: {
    alignItems: "center",
  },
  mirrorFrame: {
    width: Math.min(width - 50, 340),
    height: Math.min(width - 50, 340) * 1.15,
    borderRadius: 24,
    overflow: "hidden",
    position: 'relative',
  },
  mirror: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  mirrorQuoteIconLeft: {
    position: 'absolute',
    left: -20,
    top: -20,
    zIndex: 1,
  },
  mirrorQuoteIconRight: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
  },
  mirrorMessageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  mirrorMessageContent: {
    marginBottom: 12,
  },
  mirrorMessageText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    lineHeight: 24,
    textAlign: "center",
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  mirrorProgressDots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  mirrorProgressDot: {
    height: 6,
    borderRadius: 3,
    width: 6,
  },
  mirrorProgressDotActive: {
    width: 24,
  },
  messageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 24,
  },
  messageContentWrapper: {
    height: 140,
    justifyContent: "center",
    zIndex: 1,
  },
  messageContent: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  messageText: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
    lineHeight: 26,
    textAlign: "center",
    minHeight: 78,
  },
  progressDots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 20,
    zIndex: 1,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  progressDotActive: {
    width: 20,
  },
  // Permission screen styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionContent: {
    alignItems: "center",
    maxWidth: 350,
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionIconLight: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  permissionIconDark: {
    backgroundColor: "rgba(244, 67, 54, 0.15)",
  },
  permissionIcon: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: FontFamily.bold,
    textAlign: "center",
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 15,
    fontFamily: FontFamily.regular,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  permissionButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
    color: "#FFFFFF",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  secondaryButtonDark: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    opacity: 0.6,
  },
  // Breathing exercise styles
  breathingHeaderContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  breathingInstructionsContainer: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingInstructions: {
    fontSize: 13,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 18,
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
    position: 'relative',
  },
  breathingRingOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  breathingRingMiddle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  breathingCircleGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  breathingTextContainer: {
    alignItems: 'center',
    gap: 8,
  },
  breathingPhaseText: {
    fontSize: 17,
    fontFamily: FontFamily.bold,
  },
  stopHint: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
    opacity: 0.5,
    marginTop: 8,
  },
  // Crisis helpline card styles
  crisisHelplineCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  crisisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  crisisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pulsatingIndicator: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  crisisCardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  crisisSubtitleBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  crisisSubtitle: {
    fontSize: 11,
    fontFamily: FontFamily.bold,
    color: '#4CAF50',
    textTransform: 'uppercase',
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
    flexDirection: 'row',
    gap: 12,
  },
  crisisButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
  },
  crisisButtonDark: {
    backgroundColor: '#388E3C',
  },
  crisisButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  crisisButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: '#FFFFFF',
  },
  // Coping checklist styles
  copingList: {
    gap: 12,
  },
  copingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copingCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  copingCheckboxLight: {
    borderColor: 'rgba(76,175,80,0.3)',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  copingCheckboxDark: {
    borderColor: 'rgba(76,175,80,0.4)',
    backgroundColor: 'rgba(76,175,80,0.15)',
  },
  copingNumber: {
    fontSize: 14,
    fontFamily: FontFamily.bold,
    color: '#4CAF50',
  },
  copingText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FontFamily.medium,
    lineHeight: 20,
  },
});

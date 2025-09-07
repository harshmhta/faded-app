import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AIPreviewModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

export function AIPreviewModal({ visible, onClose }: AIPreviewModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollToEnd, setShowScrollToEnd] = useState(true);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearTop = contentOffset.y < 100;
    const isNearBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;

    setShowScrollToEnd(isNearTop && !isNearBottom);
  };

  const scrollToEnd = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView
        style={styles.container}
        lightColor="#FFFFFF"
        darkColor="#151718"
      >
        {/* Header with close button - positioned absolutely */}
        <View style={[styles.headerAbsolute, { top: 40 }]}>
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, isDark && styles.closeButtonDark]}
          >
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: 30, paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Hero section */}
          <View style={styles.heroSection}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require("@/assets/animations/ai-logo.lottie")}
                style={styles.lottieAnimation}
                autoPlay
                loop
              />
            </View>

            <ThemedText type="title" style={styles.heroTitle}>
              Get started with Luma
            </ThemedText>

            <ThemedText style={styles.heroDescription}>
              Designed by real people and brought to you by AI, Luma helps you
              unpack your thoughts, find gratitude, and see a new perspective.
              Share what's on your mind and get guidance through life's ebbs and
              flows.
            </ThemedText>
          </View>

          {/* Flow section */}
          <View style={styles.flowSection}>
            <ThemedText type="subtitle" style={styles.flowTitle}>
              Find your flow with Luma
            </ThemedText>

            {/* Feature items */}
            <View style={styles.featuresList}>
              <FeatureItem
                icon="✨"
                title="Explore your emotions"
                description="Take a moment to process thoughts and emotions or find gratitude."
                isDark={isDark}
              />

              <FeatureItem
                icon="💭"
                title="Process life's ups and downs"
                description="Luma will guide you with thoughtful prompts and replies along the way."
                isDark={isDark}
              />

              <FeatureItem
                icon="📋"
                title="Get personalized recommendations"
                description="You'll also get helpful exercises based on what you share."
                isDark={isDark}
              />
            </View>
          </View>

          {/* Footer section */}
          <View style={styles.footerSection}>
            <ThemedText type="subtitle" style={styles.footerTitle}>
              Built by clinical experts, with your{" "}
              <ThemedText style={[styles.footerTitle, { color: "#FF6B35" }]}>
                safety
              </ThemedText>{" "}
              and{" "}
              <ThemedText style={[styles.footerTitle, { color: "#FF6B35" }]}>
                privacy
              </ThemedText>{" "}
              in mind.
            </ThemedText>

            <ThemedText style={styles.footerDescription}>
              Your data helps us make sure Luma is as supportive as possible.
              Click below to learn more about Luma and how we protect your
              information.
            </ThemedText>

            {/* Trust indicators */}
            <View style={styles.trustSection}>
              <View style={styles.trustItem}>
                <View
                  style={[styles.trustIcon, isDark && styles.trustIconDark]}
                >
                  <ThemedText style={styles.trustEmoji}>🔬</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.trustTitle}>
                  Thoughtfully{"\n"}tested
                </ThemedText>
              </View>

              <View style={styles.trustItem}>
                <View
                  style={[styles.trustIcon, isDark && styles.trustIconDark]}
                >
                  <ThemedText style={styles.trustEmoji}>🔒</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.trustTitle}>
                  Encrypted{"\n"}conversation
                </ThemedText>
              </View>
            </View>

            {/* Learn more button */}
            <Pressable
              style={[
                styles.learnMoreButton,
                isDark && styles.learnMoreButtonDark,
              ]}
              onPress={onClose}
            >
              <ThemedText
                style={[
                  styles.learnMoreText,
                  isDark && styles.learnMoreTextDark,
                ]}
              >
                Learn more
              </ThemedText>
            </Pressable>
          </View>

          {/* Safety disclaimer section */}
          <View style={styles.safetySection}>
            <ThemedText type="subtitle" style={styles.safetyTitle}>
              Luma is not a replacement for medical advice/human care
            </ThemedText>

            <View style={styles.emergencySection}>
              <ThemedText type="defaultSemiBold" style={styles.emergencyTitle}>
                Emergency Resources
              </ThemedText>
              <ThemedText style={styles.emergencyText}>
                If you are in immediate danger, contact your local emergency
                resources or go to the nearest emergency room. Do not attempt to
                access emergency care through this app.
              </ThemedText>
              <ThemedText style={styles.emergencyText}>
                You can find mental health resources by location{" "}
                <ThemedText style={[styles.emergencyText, styles.linkText]}>
                  here.
                </ThemedText>
              </ThemedText>
            </View>

            <View style={styles.crisisSection}>
              <ThemedText type="defaultSemiBold" style={styles.crisisTitle}>
                Suicide & Crisis Lifeline (US & CA only)
              </ThemedText>
              <ThemedText style={styles.crisisText}>
                If you're in the United States or Canada and having thoughts of
                harming yourself or others, call or text the Suicide and Crisis
                Lifeline.
              </ThemedText>

              <View style={styles.crisisButtons}>
                <Pressable
                  style={[
                    styles.crisisButton,
                    isDark && styles.crisisButtonDark,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.crisisButtonText,
                      isDark && styles.crisisButtonTextDark,
                    ]}
                  >
                    Call 988
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.crisisButton,
                    isDark && styles.crisisButtonDark,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.crisisButtonText,
                      isDark && styles.crisisButtonTextDark,
                    ]}
                  >
                    Text 988
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <View style={styles.dotsSection}>
              <ThemedText style={styles.dotsIcon}>•••</ThemedText>
              <ThemedText style={styles.dotsText}>
                Tap the three dots icon in the upper right corner to return to
                these resources.
              </ThemedText>
            </View>

            <ThemedText style={styles.ageDisclaimer}>
              Luma is only intended for individuals 18 and up. Please do not use
              Luma if you are under 18.
            </ThemedText>
          </View>
        </ScrollView>

        {/* Floating scroll to end button */}
        {showScrollToEnd && (
          <Pressable
            style={[
              styles.scrollToEndButton,
              { bottom: insets.bottom + 80 },
              isDark && styles.scrollToEndButtonDark,
            ]}
            onPress={scrollToEnd}
          >
            <ThemedText
              style={[
                styles.scrollToEndText,
                isDark && styles.scrollToEndTextDark,
              ]}
            >
              Scroll to end ↓
            </ThemedText>
          </Pressable>
        )}

        {/* Gradient fade effect */}
        <LinearGradient
          colors={
            isDark
              ? [
                  "rgba(21, 23, 24, 0)",
                  "rgba(21, 23, 24, 0.8)",
                  "rgba(21, 23, 24, 1)",
                ]
              : [
                  "rgba(255, 255, 255, 0)",
                  "rgba(255, 255, 255, 0.8)",
                  "rgba(255, 255, 255, 1)",
                ]
          }
          style={[styles.backdrop, { bottom: 0, height: insets.bottom + 80 }]}
          pointerEvents="none"
        />

        {/* Floating Next button */}
        <View
          style={[
            styles.floatingButtonContainer,
            { bottom: insets.bottom + 10 },
          ]}
        >
          <Pressable style={styles.floatingNextButton} onPress={onClose}>
            <ThemedText style={styles.floatingNextButtonText}>Next</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  isDark: boolean;
}

function FeatureItem({ icon, title, description, isDark }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, isDark && styles.featureIconDark]}>
        <ThemedText style={styles.featureEmoji}>{icon}</ThemedText>
      </View>
      <View style={styles.featureContent}>
        <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  closeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  animationContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  lottieAnimation: {
    width: 120,
    height: 120,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 26,
    lineHeight: 26,
    fontFamily: FontFamily.bold,
  },
  heroDescription: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 10,
  },
  flowSection: {
    paddingVertical: 32,
  },
  flowTitle: {
    textAlign: "center",
    marginBottom: 32,
  },
  featuresList: {
    gap: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5B4",
  },
  featureIconDark: {
    backgroundColor: "#2A2A2A",
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 22,
    opacity: 0.8,
  },
  footerSection: {
    paddingVertical: 32,
    paddingBottom: 40,
  },
  footerTitle: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 16,
  },
  footerDescription: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 10,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginTop: 32,
    marginBottom: 32,
  },
  trustItem: {
    alignItems: "center",
    gap: 12,
  },
  trustIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE5B4",
  },
  trustIconDark: {
    backgroundColor: "#2A2A2A",
  },
  trustEmoji: {
    fontSize: 28,
  },
  trustTitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
  },
  learnMoreButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    alignSelf: "center",
    marginTop: 8,
  },
  learnMoreButtonDark: {
    backgroundColor: "#2A2A2A",
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  learnMoreTextDark: {
    color: "#FFFFFF",
  },
  safetySection: {
    paddingVertical: 32,
    paddingHorizontal: 4,
  },
  safetyTitle: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 24,
  },
  emergencySection: {
    marginBottom: 32,
  },
  emergencyTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  emergencyText: {
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.8,
  },
  linkText: {
    textDecorationLine: "underline",
    opacity: 1,
  },
  crisisSection: {
    marginBottom: 32,
  },
  crisisTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  crisisText: {
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.8,
  },
  crisisButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  crisisButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  crisisButtonDark: {
    backgroundColor: "#2A2A2A",
  },
  crisisButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  crisisButtonTextDark: {
    color: "#FFFFFF",
  },
  dotsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  dotsIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  dotsText: {
    flex: 1,
    lineHeight: 22,
    opacity: 0.8,
  },
  ageDisclaimer: {
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
    paddingHorizontal: 16,
  },
  scrollToEndButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -70,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollToEndButtonDark: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  scrollToEndText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  scrollToEndTextDark: {
    color: "#000000",
  },
  floatingButtonContainer: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  floatingNextButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingNextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

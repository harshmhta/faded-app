import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  BubbleChatIcon,
  Call02Icon,
  CheckListIcon,
  LockIcon,
  Message01Icon,
  MicroscopeIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
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

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");

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
        lightColor={Colors.light.background}
        darkColor={Colors.dark.background}
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
              Meet Luma, your AI companion
            </ThemedText>

            <ThemedText style={styles.heroDescription}>
              Your personal guide for navigating cannabis use. Whether you're
              looking to cut back, take breaks, or quit entirely, Luma is here
              to support you every step of the way.
            </ThemedText>

            <View style={styles.heroFeatures}>
              <View
                style={[styles.featurePill, isDark && styles.featurePillDark]}
              >
                <ThemedText
                  style={[
                    styles.featurePillText,
                    isDark && styles.featurePillTextDark,
                  ]}
                >
                  24/7 Support
                </ThemedText>
              </View>
              <View
                style={[styles.featurePill, isDark && styles.featurePillDark]}
              >
                <ThemedText
                  style={[
                    styles.featurePillText,
                    isDark && styles.featurePillTextDark,
                  ]}
                >
                  Private & Secure
                </ThemedText>
              </View>
              <View
                style={[styles.featurePill, isDark && styles.featurePillDark]}
              >
                <ThemedText
                  style={[
                    styles.featurePillText,
                    isDark && styles.featurePillTextDark,
                  ]}
                >
                  Your Pace
                </ThemedText>
              </View>
            </View>
          </View>

          {/* How Luma helps section */}
          <View style={styles.flowSection}>
            <ThemedText type="subtitle" style={styles.flowTitle}>
              How Luma supports your journey
            </ThemedText>

            {/* Feature items */}
            <View style={styles.featuresList}>
              <FeatureCard
                icon={BubbleChatIcon}
                title="Talk through cravings"
                description="Share what you're feeling and get real-time support when urges hit."
                isDark={isDark}
              />

              <FeatureCard
                icon={CheckListIcon}
                title="Build healthy habits"
                description="Get personalized strategies and track your progress day by day."
                isDark={isDark}
              />

              <FeatureCard
                icon={SparklesIcon}
                title="Celebrate wins"
                description="Every milestone matters. Luma helps you recognize your achievements."
                isDark={isDark}
              />
            </View>
          </View>

          {/* Trust section */}
          <View style={styles.footerSection}>
            <ThemedText type="subtitle" style={styles.footerTitle}>
              Your privacy is protected
            </ThemedText>

            <ThemedText style={styles.footerDescription}>
              Built by addiction specialists and protected by end-to-end
              encryption. Your conversations with Luma stay between you and your
              AI companion.
            </ThemedText>

            {/* Trust indicators */}
            <View style={styles.trustSection}>
              <TrustCard
                icon={LockIcon}
                title="Private & secure"
                isDark={isDark}
              />
              <TrustCard
                icon={MicroscopeIcon}
                title="Clinically informed"
                isDark={isDark}
              />
            </View>
          </View>

          {/* Safety section - simplified */}
          <View style={styles.safetySection}>
            <ThemedText type="subtitle" style={styles.safetyTitle}>
              Need immediate help?
            </ThemedText>

            <CrisisCard
              title="Crisis Support Available"
              subtitle="24/7"
              content="If you're having thoughts of self-harm, help is available right now."
              isDark={isDark}
            />

            <View style={styles.disclaimerRow}>
              <ThemedText style={styles.disclaimerText}>
                Luma is a supportive tool, not medical treatment. For ages 18+.
              </ThemedText>
            </View>
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
            <ThemedText style={styles.floatingNextButtonText}>
              Start my journey with Luma
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </Modal>
  );
}

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  isDark: boolean;
}

function FeatureCard({ icon, title, description, isDark }: FeatureCardProps) {
  const borderColor = isDark ? "#2A2A2A" : "#E6E8EB";
  const cardBackground = isDark ? "#181A1B" : "#F6F7F9";
  const iconBackground = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <View
      style={[
        styles.featureCard,
        { borderColor, backgroundColor: cardBackground },
      ]}
    >
      <View style={styles.featureHeader}>
        <View
          style={[
            styles.featureIconContainer,
            { backgroundColor: iconBackground },
          ]}
        >
          <HugeiconsIcon
            icon={icon}
            size={20}
            color={isDark ? "#FFFFFF" : "#333333"}
          />
        </View>
        <View style={styles.featureTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
            {title}
          </ThemedText>
          <ThemedText style={styles.featureDescription}>
            {description}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

interface TrustCardProps {
  icon: any;
  title: string;
  isDark: boolean;
}

function TrustCard({ icon, title, isDark }: TrustCardProps) {
  const borderColor = isDark ? "#2A2A2A" : "#E6E8EB";
  const cardBackground = isDark ? "#181A1B" : "#F6F7F9";
  const iconBackground = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <View
      style={[
        styles.trustCard,
        { borderColor, backgroundColor: cardBackground },
      ]}
    >
      <View
        style={[styles.trustIconContainer, { backgroundColor: iconBackground }]}
      >
        <HugeiconsIcon
          icon={icon}
          size={24}
          color={isDark ? "#FFFFFF" : "#333333"}
        />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.trustTitle}>
        {title}
      </ThemedText>
    </View>
  );
}

interface PulsatingIndicatorProps {
  color: string;
}

function PulsatingIndicator({ color }: PulsatingIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.4,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
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
      <Animated.View
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

interface SafetyCardProps {
  title: string;
  content: string;
  isDark: boolean;
}

function SafetyCard({ title, content, isDark }: SafetyCardProps) {
  const borderColor = isDark ? "#FFA726" : "#FFF3E0";
  const cardBackground = isDark ? "#2A2218" : "#FFFAF5";

  return (
    <View
      style={[
        styles.safetyCard,
        { borderColor, backgroundColor: cardBackground },
      ]}
    >
      <View style={styles.safetyHeader}>
        <PulsatingIndicator color="#FFA726" />
        <ThemedText type="defaultSemiBold" style={styles.safetyCardTitle}>
          {title}
        </ThemedText>
      </View>
      <ThemedText style={styles.safetyCardContent}>{content}</ThemedText>
    </View>
  );
}

interface EmergencyCardProps {
  title: string;
  content: string;
  isDark: boolean;
}

function EmergencyCard({ title, content, isDark }: EmergencyCardProps) {
  const borderColor = isDark ? "#FF6B6B" : "#FFE5E5";
  const cardBackground = isDark ? "#2A1A1A" : "#FFF8F8";

  return (
    <View
      style={[
        styles.emergencyCard,
        { borderColor, backgroundColor: cardBackground },
      ]}
    >
      <View style={styles.emergencyHeader}>
        <PulsatingIndicator color="#FF6B6B" />
        <ThemedText type="defaultSemiBold" style={styles.emergencyCardTitle}>
          {title}
        </ThemedText>
      </View>
      <ThemedText style={styles.emergencyCardContent}>{content}</ThemedText>
    </View>
  );
}

interface CrisisCardProps {
  title: string;
  subtitle: string;
  content: string;
  isDark: boolean;
}

function CrisisCard({ title, subtitle, content, isDark }: CrisisCardProps) {
  const borderColor = isDark ? "#4CAF50" : "#E8F5E8";
  const cardBackground = isDark ? "#1A2A1A" : "#F8FFF8";

  const handleCall = () => {
    Linking.openURL("tel:988");
  };

  const handleText = () => {
    Linking.openURL("sms:988");
  };

  return (
    <View
      style={[
        styles.crisisCard,
        { borderColor, backgroundColor: cardBackground },
      ]}
    >
      <View style={styles.crisisHeaderRow}>
        <View style={styles.crisisHeaderLeft}>
          <PulsatingIndicator color="#4CAF50" />
          <ThemedText type="defaultSemiBold" style={styles.crisisCardTitle}>
            {title}
          </ThemedText>
        </View>
        <View style={styles.crisisSubtitleBadge}>
          <ThemedText style={styles.crisisSubtitle}>{subtitle}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.crisisCardContent}>{content}</ThemedText>
      <View style={styles.crisisButtons}>
        <Pressable
          style={[styles.crisisButton, isDark && styles.crisisButtonDark]}
          onPress={handleCall}
        >
          <View style={styles.crisisButtonContent}>
            <HugeiconsIcon icon={Call02Icon} size={16} color="#FFFFFF" />
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
          style={[styles.crisisButton, isDark && styles.crisisButtonDark]}
          onPress={handleText}
        >
          <View style={styles.crisisButtonContent}>
            <HugeiconsIcon icon={Message01Icon} size={16} color="#FFFFFF" />
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
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  closeButtonDark: {
    backgroundColor: "rgba(255,255,255,0.15)",
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
  heroSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
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
    fontSize: 28,
    lineHeight: 32,
    fontFamily: FontFamily.bold,
  },
  heroDescription: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 16,
    fontFamily: FontFamily.regular,
    marginBottom: 24,
  },
  heroFeatures: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  featurePill: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  featurePillText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#007AFF",
  },
  featurePillDark: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featurePillTextDark: {
    color: "#FFFFFF",
  },
  flowSection: {
    paddingVertical: 24,
  },
  flowTitle: {
    textAlign: "center",
    marginBottom: 24,
    fontFamily: FontFamily.bold,
  },
  featuresList: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: FontFamily.medium,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
  },
  footerSection: {
    paddingVertical: 24,
  },
  footerTitle: {
    textAlign: "center",
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 16,
    fontFamily: FontFamily.bold,
  },
  footerDescription: {
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.8,
    paddingHorizontal: 16,
    fontFamily: FontFamily.regular,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  trustCard: {
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    flex: 1,
    maxWidth: 140,
  },
  trustIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  trustTitle: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: FontFamily.medium,
  },
  learnMoreButton: {
    backgroundColor: "#F6F7F9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E6E8EB",
  },
  learnMoreButtonDark: {
    backgroundColor: "#181A1B",
    borderColor: "#2A2A2A",
  },
  learnMoreText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: "#333",
  },
  learnMoreTextDark: {
    color: "#FFFFFF",
  },
  safetySection: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  safetyTitle: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 20,
    fontFamily: FontFamily.bold,
    textAlign: "center",
  },
  safetyCard: {
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
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  safetyCardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  safetyCardContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
  },
  emergencyCard: {
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
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  emergencyCardTitle: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  emergencyCardContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: FontFamily.regular,
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
  disclaimerRow: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    fontFamily: FontFamily.regular,
    textAlign: "center",
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
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingNextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: FontFamily.medium,
    textAlign: "center",
  },
});

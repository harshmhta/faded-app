import { FontFamily } from "@/constants/Fonts";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
    CancelCircleIcon,
    CheckmarkCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { ThemedText } from "./ThemedText";

const { width: screenWidth } = Dimensions.get("window");

export interface ConsumptionStatus {
  date: string;
  consumed: boolean | null;
}

interface DailyConsumptionLoggerProps {
  onStatusChange?: (status: ConsumptionStatus) => void;
  initialStatus?: ConsumptionStatus | null;
}

export default function DailyConsumptionLogger({
  onStatusChange,
  initialStatus,
}: DailyConsumptionLoggerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const textColor = useThemeColor({}, "text");
  
  const today = new Date().toDateString();
  const [status, setStatus] = useState<ConsumptionStatus>(
    initialStatus || { date: today, consumed: null }
  );
  const [showMessage, setShowMessage] = useState(false);
  
  // Animation values
  const greenFillAnimation = useRef(new Animated.Value(0)).current;
  const redFillAnimation = useRef(new Animated.Value(0)).current;
  const iconScaleGreen = useRef(new Animated.Value(0)).current;
  const iconScaleRed = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset if it's a new day
    if (status.date !== today) {
      setStatus({ date: today, consumed: null });
      setShowMessage(false);
      greenFillAnimation.setValue(0);
      redFillAnimation.setValue(0);
      iconScaleGreen.setValue(0);
      iconScaleRed.setValue(0);
      messageOpacity.setValue(0);
    }
  }, [today]);

  const handleGreenPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const newStatus = { date: today, consumed: false };
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    
    // Reset red animation
    Animated.timing(redFillAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Animate green fill and icon
    Animated.sequence([
      Animated.timing(greenFillAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.spring(iconScaleGreen, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show message
    setShowMessage(true);
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleRedPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const newStatus = { date: today, consumed: true };
    setStatus(newStatus);
    onStatusChange?.(newStatus);
    
    // Reset green animation
    Animated.timing(greenFillAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Animate red fill and icon
    Animated.sequence([
      Animated.timing(redFillAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.spring(iconScaleRed, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show message
    setShowMessage(true);
    Animated.timing(messageOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const greenFillWidth = greenFillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const redFillWidth = redFillAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const getMessage = () => {
    if (status.consumed === null) return "";
    if (status.consumed) {
      return "It's okay! Tomorrow is a new day. Every journey has its ups and downs. 💪";
    }
    return "Amazing! You're crushing it! Keep up the great work! 🌟";
  };

  const getMessageColor = () => {
    if (status.consumed === null) return textColor;
    return status.consumed ? "#FF6B6B" : "#4CAF50";
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Did you consume today?</ThemedText>
      
      <View style={styles.buttonsContainer}>
        {/* Green Button - No */}
        <Pressable
          onPress={handleGreenPress}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isDark ? "#4CAF5020" : "#4CAF5015",
              borderColor: "#4CAF5030",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.fillAnimation,
              {
                width: greenFillWidth,
                backgroundColor: "#4CAF50",
              },
            ]}
          />
          <View style={styles.buttonContent}>
            <ThemedText style={styles.emoji}>🌿</ThemedText>
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              Stayed Clean
            </ThemedText>
          </View>
          {status.consumed === false && (
            <Animated.View
              style={[
                styles.iconOverlay,
                {
                  transform: [{ scale: iconScaleGreen }],
                },
              ]}
            >
              <HugeiconsIcon
                icon={CheckmarkCircleIcon}
                size={48}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </Animated.View>
          )}
        </Pressable>

        {/* Red Button - Yes */}
        <Pressable
          onPress={handleRedPress}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: isDark ? "#FF6B6B20" : "#FF6B6B15",
              borderColor: "#FF6B6B30",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.fillAnimation,
              {
                width: redFillWidth,
                backgroundColor: "#FF6B6B",
              },
            ]}
          />
          <View style={styles.buttonContent}>
            <ThemedText style={styles.emoji}>🍃</ThemedText>
            <ThemedText style={[styles.buttonText, { color: textColor }]}>
              I Consumed
            </ThemedText>
          </View>
          {status.consumed === true && (
            <Animated.View
              style={[
                styles.iconOverlay,
                {
                  transform: [{ scale: iconScaleRed }],
                },
              ]}
            >
              <HugeiconsIcon
                icon={CancelCircleIcon}
                size={48}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </Animated.View>
          )}
        </Pressable>
      </View>

      {showMessage && (
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: messageOpacity,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.message,
              {
                color: getMessageColor(),
              },
            ]}
          >
            {getMessage()}
          </ThemedText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  fillAnimation: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 20,
  },
  buttonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    zIndex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  iconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  messageContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  message: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    textAlign: "center",
    lineHeight: 20,
  },
});

import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { G, Path } from "react-native-svg";

import { useTheme } from "@/contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface StartupScreenProps {
  onAnimationComplete: () => void;
}

export function StartupScreen({ onAnimationComplete }: StartupScreenProps) {
  const { colorScheme } = useTheme();
  const logoScale = useSharedValue(0.4); // Start small but visible
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0); // Start straight
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    const startAnimation = () => {
      // 1. Logo appears centered and small
      logoOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.quad),
      });

      // 2. Pull back smaller (anticipation) - slower tension building
      setTimeout(() => {
        logoScale.value = withTiming(0.3, {
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
        });
      }, 600);

      // 3. Shoots quickly towards screen - much faster explosive release
      setTimeout(() => {
        logoScale.value = withTiming(8, {
          duration: 600,
          easing: Easing.in(Easing.cubic),
        });

        // Logo fades as it flies past
        logoOpacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.in(Easing.quad),
        });
      }, 1400);

      // Screen transition happens right at the peak of the rocket flight
      setTimeout(() => {
        screenOpacity.value = withTiming(
          0,
          {
            duration: 100,
            easing: Easing.in(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(onAnimationComplete)();
            }
          },
        );
      }, 1700); // At peak of rocket animation - no blank screen
    };

    startAnimation();
  }, [logoOpacity, logoScale, onAnimationComplete, screenOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotateZ: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const backgroundColor = colorScheme === "dark" ? "#000000" : "#ffffff";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.screenContent, screenStyle]}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <Svg
            width={200}
            height={284}
            viewBox="0 0 409 581"
            style={styles.logo}
          >
            <G fill="#22c55e" stroke="#22c55e" strokeWidth="0.5">
              <Path d="M151.9 576.4 c-25.3 -4.5 -48.6 -16.9 -67.4 -35.8 -15.1 -15.2 -26 -33 -32.9 -54 -6.3 -19.1 -6.2 -55.5 0.4 -75.5 5.7 -17.6 13.6 -30.6 26.9 -44.4 4.8 -5 8 -9.1 7.5 -9.6 -0.5 -0.4 -3.1 -1.6 -5.9 -2.6 -7.7 -2.8 -21.8 -11.1 -29.8 -17.4 -25.4 -20.3 -41.1 -46.8 -46.3 -78 -1.3 -8.1 -1.5 -13.9 -1.1 -26 0.7 -20.1 3.5 -32.1 11.2 -47.9 5.2 -10.5 6.4 -12.2 19.9 -26.5 7.9 -8.3 41.7 -42.4 75.2 -75.7 56.3 -55.9 61.6 -60.9 69.8 -65.7 10.4 -6.2 21.3 -10.5 34.6 -14 9 -2.3 10.6 -2.4 30 -2 21.6 0.5 29.7 1.7 41.1 6 26.1 9.9 50.3 28 65.3 49 9.2 12.8 17.1 31.1 19.5 45.1 1.6 8.9 1.3 33.9 -0.4 44.2 -2.1 11.7 -7.6 27.9 -12.8 37.7 -7.6 14.3 -25.4 35.9 -33.2 40.3 -3.2 1.8 -1.1 4.2 5.2 5.9 16.2 4.5 27.7 11.5 40.8 24.9 14.4 14.7 24.5 31.4 31.4 52.1 2.2 6.6 4.5 15.8 5 20.5 2.2 17.4 0.9 38.9 -3 52.5 -2.5 8.5 -11.3 27.1 -16.1 34.4 -11.3 16.7 -118.5 125.2 -138.2 139.8 -14.2 10.5 -33.1 18.6 -52 22.2 -12.6 2.5 -32.8 2.7 -44.7 0.5z m28.4 -63.4 c7.9 -1.2 19.8 -7.1 27.8 -13.6 10.2 -8.3 85.2 -85.3 112 -114.9 12.6 -14 18.4 -24.6 20 -36.7 1.5 -11.1 0 -19.7 -5.5 -31.3 -3.7 -7.8 -5.5 -10.2 -13.2 -17.5 -15 -14.4 -26.4 -19.5 -42.4 -18.8 -8.2 0.3 -10.3 0.7 -14.5 3.2 -3.4 1.8 -19.2 17.1 -48.3 46.4 -76.1 76.7 -96.3 98 -100 104.9 -9.5 18.1 -4.9 42.5 11.3 60.1 13.5 14.6 33.3 21.4 52.8 18.2z m-34.9 -215.8 c4.5 -1.5 10 -4.2 12.9 -6.3 7.1 -5.3 60 -56.6 98.3 -95.1 41.5 -41.7 45.2 -47.2 46.2 -66.7 0.8 -18.7 -3.2 -29.5 -15.8 -42.2 -18.8 -18.8 -48.3 -24.4 -69.4 -13.1 -9.2 4.9 -130.6 127 -139.2 139.9 -7.4 11.3 -10.2 26.7 -7 39.3 5.1 20.2 20.4 37.5 39 44.1 12.6 4.4 21.8 4.4 35 0.1z" />
            </G>
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screenContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth,
    height: screenHeight,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    shadowColor: "#22c55e",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
});

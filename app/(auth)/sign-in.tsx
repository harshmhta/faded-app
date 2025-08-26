import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";

export default function SignInScreen() {
  const { signInWithApple, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleAppleSignIn = async () => {
    try {
      const success = await signInWithApple();

      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Failed to sign in with Apple. Please try again.");
      }
    } catch (error) {
      console.error("Apple sign in error:", error);
      Alert.alert(
        "Error",
        "An error occurred during sign in. Please try again.",
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontFamily: FontFamily.bold,
      textAlign: "center",
      marginBottom: 20,
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 50,
      color: colors.text,
      opacity: 0.7,
    },
    appleButton: {
      width: 280,
      height: 50,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Faded</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={5}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        {Platform.OS !== "ios" && (
          <Text style={[styles.subtitle, { marginTop: 20 }]}>
            Apple Sign-in is only available on iOS devices
          </Text>
        )}
      </View>
    </View>
  );
}

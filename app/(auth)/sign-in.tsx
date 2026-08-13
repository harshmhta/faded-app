import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

export default function SignInScreen() {
  const { signInWithApple, signInWithGoogle, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // An empty message means the user cancelled — say nothing rather than
  // popping an error alert at someone who deliberately backed out.
  const handleAppleSignIn = async () => {
    const result = await signInWithApple();
    if (result.ok) {
      router.replace("/(tabs)");
    } else if (result.message) {
      Alert.alert("Couldn't sign in", result.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.ok) {
      router.replace("/(tabs)");
    } else if (result.message) {
      Alert.alert("Couldn't sign in", result.message);
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
    googleButton: {
      width: 280,
      height: 50,
      borderRadius: 4,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#dadce0",
      marginTop: 16,
    },
    googleContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    googleText: {
      color: "#3c4043",
      fontSize: 16,
      fontFamily: FontFamily.bold,
    },
    inlineLinkRow: {
      marginTop: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    linkText: {
      color: colors.tint,
      textDecorationLine: "underline",
      fontFamily: FontFamily.bold,
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          disabled={isLoading}
          onPress={handleGoogleSignIn}
          style={styles.googleButton}
        >
          <View style={styles.googleContent}>
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                fill="#4285F4"
                d="M24 12.276c0-.851-.076-1.67-.218-2.455H12v4.651h6.859c-.295 1.58-1.19 2.918-2.527 3.817v3.167h4.084c2.381-2.19 3.784-5.418 3.784-9.18z"
              />
              <Path
                fill="#34A853"
                d="M12 24c3.24 0 5.958-1.08 7.944-2.951l-4.084-3.167c-1.134.76-2.582 1.214-3.86 1.214-2.972 0-5.495-2.006-6.395-4.708H1.39v2.96C3.364 21.316 7.36 24 12 24z"
              />
              <Path
                fill="#FBBC05"
                d="M5.605 14.388a7.22 7.22 0 0 1 0-4.776V6.652H1.39a12.003 12.003 0 0 0 0 10.696l4.215-2.96z"
              />
              <Path
                fill="#EA4335"
                d="M12 4.73c1.76 0 3.34.605 4.587 1.792l3.44-3.44C17.958 1.08 15.24 0 12 0 7.36 0 3.364 2.684 1.39 6.652l4.215 2.96C6.505 6.736 9.028 4.73 12 4.73z"
              />
            </Svg>
            <Text style={styles.googleText}>Sign in with Google</Text>
          </View>
        </Pressable>

        <View style={styles.inlineLinkRow}>
          <Text style={[styles.subtitle, { marginBottom: 0, opacity: 0.8 }]}>
            Alternatively, sign up/in with
          </Text>
          <Text
            accessibilityRole="link"
            style={styles.linkText}
            onPress={() => router.push("/(auth)/email")}
          >
            email
          </Text>
        </View>
      </View>
    </View>
  );
}

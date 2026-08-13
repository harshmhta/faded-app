import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EmailAuthScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedEmail = email.trim();
  const canSubmit =
    trimmedEmail.includes("@") &&
    password.length >= 6 &&
    (mode === "signin" || name.trim().length > 0) &&
    !isSubmitting;

  const onSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const result =
        mode === "signin"
          ? await signInWithEmail(trimmedEmail, password)
          : await signUpWithEmail(name.trim(), trimmedEmail, password);

      if (result.ok) {
        router.replace("/(tabs)");
      } else if (result.message) {
        // The context already translates Supabase errors into something a
        // person can act on, so show it rather than a generic failure.
        Alert.alert(
          mode === "signin" ? "Couldn't sign in" : "Couldn't create account",
          result.message,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 24, gap: 16, justifyContent: "center" },
    title: { fontSize: 28, fontFamily: FontFamily.bold, color: colors.text },
    input: {
      borderWidth: 1,
      borderColor: "#dadce0",
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === "ios" ? 14 : 10,
      color: colors.text,
      backgroundColor: "#fff",
    },
    cta: {
      marginTop: 8,
      color: colors.tint,
      fontFamily: FontFamily.bold,
    },
    switchRow: { flexDirection: "row", gap: 6 },
    button: {
      marginTop: 10,
      backgroundColor: colors.tint,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: { color: "#fff", fontFamily: FontFamily.bold, fontSize: 16 },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === "signin" ? "Sign in with Email" : "Create your account"}
        </Text>

        {mode === "signup" && (
          <TextInput
            placeholder="Full name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor="#8e8e93"
          />
        )}

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#8e8e93"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#8e8e93"
        />

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          accessibilityRole="button"
          accessibilityLabel={mode === "signin" ? "Sign in" : "Sign up"}
          accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
          disabled={!canSubmit}
          onPress={onSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Text>
          )}
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}>
            {" "}
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          </Text>
          <Text
            style={styles.cta}
            onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";

export default function EmailAuthScreen() {
  const { signInWithEmail, signUpWithEmail, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    const ok =
      mode === "signin"
        ? await signInWithEmail(email.trim(), password)
        : await signUpWithEmail(name.trim(), email.trim(), password);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "Authentication failed. Please check details and try again.");
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
    },
    buttonText: { color: "#fff", fontFamily: FontFamily.bold, fontSize: 16 },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>{mode === "signin" ? "Sign in with Email" : "Create your account"}</Text>

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

        <View style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText} onPress={onSubmit}>
            {mode === "signin" ? "Sign in" : "Sign up"}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={{ color: colors.text }}> {mode === "signin" ? "New here?" : "Already have an account?"} </Text>
          <Text style={styles.cta} onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create one" : "Sign in"}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}



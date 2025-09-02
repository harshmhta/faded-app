import { account } from "@/lib/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AppleAuthentication from "expo-apple-authentication";
import { makeRedirectUri } from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

export interface User {
  $id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithApple: () => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      // Try to get current user session from Appwrite backend only
      const currentUser = await account.get();
      const user: User = {
        $id: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name,
      };
      setUser(user);
      console.log("Active Appwrite session found for user:", user.email);
    } catch (error) {
      // No active Appwrite session, user needs to sign in
      console.log("No active Appwrite session found");
      setUser(null);
      // Clear any old local storage data for security
      await AsyncStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        console.error("Apple Authentication is not available on this device");
        return false;
      }

      // Perform native Apple authentication
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleCredential.identityToken || !appleCredential.user) {
        console.error(
          "Apple Sign-In failed: Missing identity token or user identifier",
        );
        return false;
      }

      // React Native doesn't support OAuth2 browser redirects, use secure manual account creation
      // Handle both shared and anonymous emails
      const email =
        appleCredential.email ||
        `${appleCredential.user}@privaterelay.appleid.com`;

      // Ensure name is valid (1-128 chars)
      let name = "Apple User"; // Default fallback
      if (appleCredential.fullName) {
        const firstName = appleCredential.fullName.givenName || "";
        const lastName = appleCredential.fullName.familyName || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName.length > 0) {
          // Truncate if too long (max 128 chars)
          name = fullName.length > 128 ? fullName.substring(0, 128) : fullName;
        }
      }

      // Use Apple's stable user identifier as the primary key
      // This ensures consistency for both shared and anonymous emails
      const appleUserIdHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `apple_stable_${appleCredential.user}`,
        { encoding: Crypto.CryptoEncoding.HEX },
      );
      const appwriteUserId = `apple_${appleUserIdHash.substring(0, 28)}`;

      // Create a secure, consistent password using Apple's stable user ID
      const passwordHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `apple_secure_password_${appleCredential.user}`,
        { encoding: Crypto.CryptoEncoding.HEX },
      );
      const password = passwordHash.substring(0, 32);

      let currentUser;
      try {
        // Try to create a new account with Apple's stable user identifier
        currentUser = await account.create(
          appwriteUserId as any,
          email,
          password,
          name,
        );

        console.log("Created new Apple user account:", {
          id: appwriteUserId,
          email,
          name,
        });

        // Create session for the new user
        await account.createEmailPasswordSession(email, password);
        currentUser = await account.get();
      } catch (createError: any) {
        if (
          createError.code === 409 ||
          createError.type === "user_already_exists"
        ) {
          console.log("Apple user already exists, attempting sign-in...");
          // User already exists, sign them in with consistent password
          try {
            await account.createEmailPasswordSession(email, password);
            currentUser = await account.get();
            console.log("Successfully signed in existing Apple user");
          } catch (loginError: any) {
            console.error(
              "Failed to login existing Apple user with consistent password:",
              loginError,
            );
            // This should not happen with our consistent password approach
            throw new Error(
              `Authentication failed for Apple user: ${String(loginError?.message || loginError)}`,
            );
          }
        } else {
          console.error(
            "Unexpected error creating Apple user account:",
            createError,
          );
          throw createError;
        }
      }

      const user: User = {
        $id: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name,
      };

      console.log("Apple Sign-In successful:", {
        id: user.$id,
        email: user.email,
        isPrivateEmail: user.email.includes("@privaterelay.appleid.com"),
      });

      setUser(user);
      return true;
    } catch (error) {
      console.error("Apple Sign In error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Delete the current session from Appwrite backend
      await account.deleteSession("current");
      console.log("Successfully signed out from Appwrite");
      setUser(null);
      // Clear any local storage for security
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Sign out error:", error);
      // Even if the API call fails, clear local user state for security
      await AsyncStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithApple,
    signInWithGoogle: async () => {
      try {
        setIsLoading(true);

        // Web: Use Appwrite OAuth session which handles cookies
        if (Platform.OS === "web") {
          const origin = window.location.origin;
          const successUrl = `${origin}/oauth-success`;
          const failureUrl = `${origin}/(auth)/sign-in?error=google`;
          await account.createOAuth2Session(
            "google" as any,
            successUrl,
            failureUrl,
            [],
          );
          return true;
        }

        // Native: Appwrite recommended flow with deep link using preferLocalhost
        const deepLink = new URL(makeRedirectUri({ preferLocalhost: true }));
        const scheme = `${deepLink.protocol}//`;
        // @ts-ignore SDK returns URL
        const loginUrl = await (account as any).createOAuth2Token({
          provider: "google",
          success: `${deepLink}`,
          failure: `${deepLink}`,
        });
        const result = await WebBrowser.openAuthSessionAsync(
          `${loginUrl}`,
          scheme,
        );
        if (result.type !== "success" || !result.url) return false;
        const returned = new URL(result.url);
        const secret = returned.searchParams.get("secret");
        const userId = returned.searchParams.get("userId");
        if (!secret || !userId) return false;
        await account.createSession(userId, secret);
        await loadStoredAuth();
        return true;
      } catch (error) {
        console.error("Google Sign In error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    signInWithEmail: async (email: string, password: string) => {
      try {
        setIsLoading(true);
        await account.createEmailPasswordSession(email, password);
        await loadStoredAuth();
        return true;
      } catch (error) {
        console.error("Email Sign In error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    signUpWithEmail: async (name: string, email: string, password: string) => {
      try {
        setIsLoading(true);
        // Create user then sign in
        // Generate a stable userId from email
        const user = await account.create(
          "unique()" as any,
          email,
          password,
          name,
        );
        await account.createEmailPasswordSession(email, password);
        await loadStoredAuth();
        return true;
      } catch (error) {
        console.error("Email Sign Up error:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    signOut,
    refreshUser: loadStoredAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import { account } from '@/lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
  signOut: () => Promise<void>;
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
      // Try to get current user session from Appwrite
      const currentUser = await account.get();
      const user: User = {
        $id: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name,
      };
      setUser(user);
    } catch (error) {
      // No active session, user needs to sign in
      console.log('No active session found');
      setUser(null);
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
        console.error('Apple Authentication is not available on this device');
        return false;
      }

      // Perform native Apple authentication
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Use Apple ID token to create session with Appwrite
      if (appleCredential.identityToken) {
        try {
          const email = appleCredential.email || `${appleCredential.user}@privaterelay.appleid.com`;
          
          // Ensure name is valid (1-128 chars)
          let name = 'Apple User'; // Default fallback
          if (appleCredential.fullName) {
            const firstName = appleCredential.fullName.givenName || '';
            const lastName = appleCredential.fullName.familyName || '';
            const fullName = `${firstName} ${lastName}`.trim();
            
            if (fullName.length > 0) {
              // Truncate if too long (max 128 chars)
              name = fullName.length > 128 ? fullName.substring(0, 128) : fullName;
            }
          }
          
          // Create a valid Appwrite user ID from Apple user ID
          // Apple IDs are too long and may contain invalid chars, so we'll hash them
          const appleUserIdHash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            appleCredential.user,
            { encoding: Crypto.CryptoEncoding.HEX }
          );
          // Take first 32 characters and prefix with 'a' to ensure it starts with a letter
          const appwriteUserId = `a${appleUserIdHash.substring(0, 31)}`;
          
          // Create a password based on Apple user ID (in production, use proper password hashing)
          const password = `apple_${appleCredential.user}_${appleCredential.identityToken?.slice(0, 10)}`;
          
          let currentUser;
          try {
            // Try to create a new account with hashed Apple user ID as the account ID
            currentUser = await account.create(
              appwriteUserId, // Use hashed Apple user ID as Appwrite user ID for consistency
              email,
              password,
              name
            );
            
            // Create session for the new user
            await account.createEmailPasswordSession(email, password);
            currentUser = await account.get();
          } catch (createError: any) {
            if (createError.code === 409 || createError.type === 'user_already_exists') {
              // User already exists, just sign them in
              try {
                await account.createEmailPasswordSession(email, password);
                currentUser = await account.get();
              } catch (loginError) {
                // If login fails, try to update the existing user's password
                console.log('Login failed, this might be a password mismatch. In production, implement proper Apple ID verification.');
                throw loginError;
              }
            } else {
              throw createError;
            }
          }
          
          const user: User = {
            $id: currentUser.$id,
            email: currentUser.email,
            name: currentUser.name,
          };
          
          setUser(user);
          return true;
        } catch (appwriteError) {
          console.error('Appwrite session error:', appwriteError);
          // Fall back to local storage if Appwrite fails
          const user: User = {
            $id: appleCredential.user,
            email: appleCredential.email || `${appleCredential.user}@privaterelay.appleid.com`,
            name: appleCredential.fullName 
              ? `${appleCredential.fullName.givenName || ''} ${appleCredential.fullName.familyName || ''}`.trim()
              : 'Apple User',
          };
          
          await AsyncStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Apple Sign In error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  const signOut = async () => {
    try {
      setIsLoading(true);
      // Delete the current session from Appwrite
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if the API call fails, clear local user state
      await AsyncStorage.removeItem('user');
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
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

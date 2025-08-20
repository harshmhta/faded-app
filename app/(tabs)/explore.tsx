import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabTwoScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.crop.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.userInfoContainer}>
        <ThemedText type="subtitle">Welcome back!</ThemedText>
        <ThemedView style={styles.userDetails}>
          <ThemedText type="defaultSemiBold">Name: {user?.name}</ThemedText>
          <ThemedText>Email: {user?.email}</ThemedText>
          <ThemedText>User ID: {user?.$id}</ThemedText>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: colors.tint }]}
        onPress={handleLogout}
      >
        <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
      </TouchableOpacity>

      <Collapsible title="Authentication Features">
        <ThemedText>
          ✅ Protected routes - Only authenticated users can access the main app
        </ThemedText>
        <ThemedText>
          ✅ Apple Sign-in - Sign in securely with Apple ID using native authentication
        </ThemedText>
        <ThemedText>
          ✅ Auto-redirect - Users are automatically redirected based on auth state
        </ThemedText>
        <ThemedText>
          ✅ Appwrite Integration - User sessions managed with Appwrite backend
        </ThemedText>
      </Collapsible>

      <Collapsible title="Apple Sign-in Info">
        <ThemedText>
          This app uses Apple Sign-in for authentication, with session management via Appwrite.
        </ThemedText>
        <ThemedText type="defaultSemiBold">Bundle ID: com.fadedapp</ThemedText>
        <ThemedText type="defaultSemiBold">Backend: Appwrite with native Apple auth</ThemedText>
      </Collapsible>

      <Collapsible title="File-based routing">
        <ThemedText>
          This app now has Apple authentication route:{' '}
          <ThemedText type="defaultSemiBold">app/(auth)/sign-in.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          Protected routes: <ThemedText type="defaultSemiBold">app/(tabs)/*</ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  userInfoContainer: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  userDetails: {
    marginTop: 10,
    gap: 5,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

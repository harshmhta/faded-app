import { useTheme } from "@react-navigation/native";
import { Stack, router } from "expo-router";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { GradientAvatar } from "@/components/GradientAvatar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { FontFamily } from "@/constants/Fonts";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  AccountSetting03Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CreditCardIcon,
  CustomerSupportIcon,
  Logout02Icon,
  NewTwitterIcon,
  NotificationBubbleIcon,
  PaintBoardIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";

interface SettingItemProps {
  icon: any;
  title: string;
  onPress?: () => void;
  showArrow?: boolean;
  isExternal?: boolean;
  compact?: boolean;
}

function SettingItem({
  icon,
  title,
  onPress,
  showArrow = true,
  isExternal = false,
  compact = false,
}: SettingItemProps) {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      style={compact ? styles.settingRowCompact : styles.settingRow}
      onPress={onPress}
    >
      <ThemedView style={styles.settingLeft}>
        <ThemedView style={styles.iconContainer}>
          <HugeiconsIcon
            icon={icon}
            size={20}
            color={Colors[colorScheme ?? "light"].icon}
            strokeWidth={2.0}
          />
        </ThemedView>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      </ThemedView>
      {showArrow && (
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={16}
          color={Colors[colorScheme ?? "light"].icon}
          strokeWidth={2.0}
        />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { user, signOut } = useAuth();
  const { colors } = useTheme();

  const handleRateApp = () => {
    // Replace with actual App Store URL
    Linking.openURL("https://apps.apple.com/app/your-app-id");
  };

  const handleFollowSocial = () => {
    // Replace with actual social media URL
    Linking.openURL("https://x.com/getfadedapp");
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerTitleStyle: {
            fontSize: 18,
            fontFamily: FontFamily.medium,
            color: colors.text,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={24}
                color={colors.text}
                strokeWidth={2.0}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <TouchableOpacity style={styles.profileSection}>
            <GradientAvatar name={user?.name || "User"} size={56} />
            <ThemedView style={styles.profileInfo}>
              <ThemedText style={styles.userName}>
                {user?.name || "User"}
              </ThemedText>
              <ThemedText style={styles.editProfile}>Edit Profile</ThemedText>
            </ThemedView>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={16}
              color={Colors[colorScheme ?? "light"].icon}
              strokeWidth={2.0}
            />
          </TouchableOpacity>

          {/* Account Section */}
          <ThemedView style={styles.section}>
            <SettingItem
              icon={AccountSetting03Icon}
              title="Account Settings"
              onPress={() => {}}
              compact={true}
            />
            <SettingItem
              icon={CreditCardIcon}
              title="Subscription"
              onPress={() => {}}
              compact={true}
            />
          </ThemedView>

          {/* Preferences Section */}
          <ThemedView style={styles.sectionWithHeader}>
            <ThemedText style={styles.sectionHeader}>Preferences</ThemedText>
            <SettingItem
              icon={NotificationBubbleIcon}
              title="Notifications"
              onPress={() => {}}
              compact={true}
            />
            <SettingItem
              icon={PaintBoardIcon}
              title="Appearance"
              onPress={() => router.push("/appearance")}
              compact={true}
            />
          </ThemedView>

          {/* Resources Section */}
          <ThemedView style={styles.sectionWithHeader}>
            <ThemedText style={styles.sectionHeader}>Resources</ThemedText>
            <SettingItem
              icon={CustomerSupportIcon}
              title="Contact Support"
              onPress={() => {}}
              showArrow={false}
              compact={true}
            />
            <SettingItem
              icon={StarIcon}
              title="Rate in App Store"
              onPress={handleRateApp}
              isExternal={true}
              compact={true}
            />
            <SettingItem
              icon={NewTwitterIcon}
              title="Follow @Faded"
              onPress={handleFollowSocial}
              isExternal={true}
              compact={true}
            />
          </ThemedView>

          {/* Sign Out */}
          <ThemedView style={styles.section}>
            <SettingItem
              icon={Logout02Icon}
              title="Sign Out"
              onPress={handleSignOut}
              showArrow={false}
            />
          </ThemedView>

          {/* Footer */}
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.logoText}>faded</ThemedText>
            <ThemedText style={styles.versionText}>
              Version 0.0.2 (alpha)
            </ThemedText>
            <ThemedView style={styles.footerLinks}>
              <TouchableOpacity>
                <ThemedText style={styles.footerLinkText}>
                  Terms & Privacy
                </ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.footerSeparator}> • </ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.footerLinkText}>
                  Data & Acknowledgments
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerButton: {
    padding: 8,
    marginLeft: -4,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: "transparent",
  },
  userName: {
    fontSize: 20,
    fontFamily: FontFamily.medium,
    marginBottom: 4,
  },
  editProfile: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  sectionWithHeader: {
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    opacity: 0.6,
    marginBottom: 8,
    marginLeft: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  settingRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "transparent",
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  logoText: {
    fontSize: 24,
    fontFamily: FontFamily.light,
    marginBottom: 8,
    opacity: 0.8,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 16,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  footerLinkText: {
    fontSize: 12,
    opacity: 0.6,
  },
  footerSeparator: {
    fontSize: 12,
    opacity: 0.6,
  },
});

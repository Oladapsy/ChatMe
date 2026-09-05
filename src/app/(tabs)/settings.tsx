import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SettingItem } from "@/features/settings/components/SettingItem";

// Icons
import EditIcon from "@/assets/icons/shared/edit.svg";
import QrCodeIcon from "@/assets/icons/shared/qrCode.svg";
import StarIcon from "@/assets/icons/settings/star.svg";
import CallIcon from "@/assets/icons/settings/call.svg";
import FolderIcon from "@/assets/icons/settings/folder.svg";
import AppearanceIcon from "@/assets/icons/settings/appearance.svg";
import NotificationIcon from "@/assets/icons/settings/notification.svg";
import PrivacyIcon from "@/assets/icons/settings/privacy.svg";
import StorageIcon from "@/assets/icons/settings/storage.svg";
import FaqIcon from "@/assets/icons/settings/faq.svg";
import LogoutIcon from "@/assets/icons/settings/logout.svg";

// logout function
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useMe } from "@/features/auth/hooks/useMe";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  const logoutMutation = useLogout();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { data: profile, isPending, isError, error } = useMe();

  // Mock Profile Data
  if (isPending) {
    return (
      <View>
        <ActivityIndicator color={themeColors.primary} />
      </View>
    );
  }

  if (isError) {
    console.log("Failed to fetch user:", error);
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <MySafeAreaView style={{ backgroundColor: themeColors.settingsBg }}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Typography
          size={24}
          weight="bold"
          color={themeColors.text}
          style={{ lineHeight: 32 }}
        >
          Settings
        </Typography>
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={styles.headerBtn}
        >
          <EditIcon width={17} height={17} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Card Header */}
      <View style={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Image
            source={
              profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : require("@/assets/images/default-avatar.png")
            }
            style={styles.avatar}
          />
          <View style={styles.profileDetails}>
            <Typography size={20} weight="bold" color={themeColors.text}>
              {profile.displayName || "no name"}
            </Typography>
            <Typography
              size={15}
              color={themeColors.textSecondary}
              style={{ marginTop: 4 }}
            >
              {profile.phoneNumber ? profile.phoneNumber : "no phone"}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/user-qr")}
            style={styles.qrBtn}
          >
            <QrCodeIcon width={28} height={28} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#1F3C51" : "#EAEEF2" },
          ]}
        />

        {/* Section 1 */}
        <SettingItem
          icon={<StarIcon width={16} height={16} color={themeColors.primary} />}
          label="Star messages"
          onPress={() => router.push("/starred-messages")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={<CallIcon width={16} height={16} color={themeColors.primary} />}
          label="Last call"
          onPress={() => router.push("/last-call")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <FolderIcon width={16} height={16} color={themeColors.primary} />
          }
          label="My folder"
          // onPress={() => router.push("/my-folders")}
          onPress={() => console.log("Folder Part will come in 2.0")}
          isDark={isDark}
          themeColors={themeColors}
        />
        {/* Appearance */}
        <SettingItem
          icon={
            <AppearanceIcon
              width={16}
              height={16}
              color={themeColors.primary}
            />
          }
          label="Appearance"
          onPress={() => router.push("/(settings)/appearance")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <NotificationIcon
              width={16}
              height={16}
              color={themeColors.primary}
            />
          }
          label="Notification"
          hasSwitch
          switchValue={notificationsEnabled}
          onSwitchChange={setNotificationsEnabled}
          isDark={isDark}
          themeColors={themeColors}
        />

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#1F3C51" : "#EAEEF2" },
          ]}
        />

        {/* Section 2 -> Privacy*/}
        <SettingItem
          icon={
            <PrivacyIcon width={16} height={16} color={themeColors.primary} />
          }
          label="Privacy"
          onPress={() =>
            router.push({
              pathname: "/(settings)/privacy",
            })
          }
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <StorageIcon width={16} height={16} color={themeColors.primary} />
          }
          label="Data and storage"
          onPress={() => router.push("/(settings)/data-storage")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={<FaqIcon width={16} height={16} color={themeColors.primary} />}
          label="FAQ"
          onPress={() => router.push("/(settings)/faq")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <LogoutIcon width={16} height={16} color={themeColors.primary} />
          }
          label="Logout"
          showChevron={false}
          onPress={handleLogout}
          isDark={isDark}
          themeColors={themeColors}
        />

        {/* App Version Footer */}
        <Typography
          size={12}
          color={themeColors.textSecondary}
          style={styles.versionText}
        >
          2026 ChatMe • Ver 1.0
        </Typography>
      </View>
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  qrBtn: {
    padding: 6,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  versionText: {
    marginTop: 16,
    textAlign: "center",
    opacity: 0.6,
  },
});

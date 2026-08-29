import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
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

export default function SettingsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock Profile Data
  const profile = {
    name: "Roberto William",
    phone: "+61-827-680-673",
    avatar: "https://i.pravatar.cc/300?img=12",
  };

  const handleLogout = () => {
    console.log("Logout triggered");
  };

  return (
    <MySafeAreaView style={{ backgroundColor: themeColors.background }}>
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
          // onPress={() => router.push("/edit-profile")}
          onPress={() => console.log("moving to edit profile page")}
          style={styles.headerBtn}
        >
          <EditIcon width={17} height={17} color={themeColors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card Header */}
        <View style={styles.profileSection}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={styles.profileDetails}>
            <Typography size={20} weight="bold" color={themeColors.text}>
              {profile.name}
            </Typography>
            <Typography
              size={14}
              color={themeColors.textSecondary}
              style={{ marginTop: 2 }}
            >
              {profile.phone}
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => console.log("Show QR Code")}
            style={styles.qrBtn}
          >
            <QrCodeIcon width={28} height={28} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#1E2D3B" : "#EAEEF2" },
          ]}
        />

        {/* Section 1 */}
        <SettingItem
          icon={<StarIcon width={20} height={20} color={themeColors.primary} />}
          label="Star messages"
          // onPress={() => router.push("/starred-messages")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={<CallIcon width={20} height={20} color={themeColors.primary} />}
          label="Last call"
          // onPress={() => router.push("/calls")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <FolderIcon width={20} height={20} color={themeColors.primary} />
          }
          label="My folder"
          // onPress={() => router.push("/my-folders")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <AppearanceIcon
              width={20}
              height={20}
              color={themeColors.primary}
            />
          }
          label="Appearence"
          onPress={() => console.log("An item pressed")}
          // onPress={() => router.push("/appearance")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <NotificationIcon
              width={20}
              height={20}
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
            { backgroundColor: isDark ? "#1E2D3B" : "#EAEEF2" },
          ]}
        />

        {/* Section 2 */}
        <SettingItem
          icon={
            <PrivacyIcon width={20} height={20} color={themeColors.primary} />
          }
          label="Privacy"
          // onPress={() => router.push("/privacy")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <StorageIcon width={20} height={20} color={themeColors.primary} />
          }
          label="Data and storage"
          // onPress={() => router.push("/data-storage")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={<FaqIcon width={20} height={20} color={themeColors.primary} />}
          label="FAQ"
          // onPress={() => router.push("/faq")}
          onPress={() => console.log("An item pressed")}
          isDark={isDark}
          themeColors={themeColors}
        />
        <SettingItem
          icon={
            <LogoutIcon width={20} height={20} color={themeColors.primary} />
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
      </ScrollView>
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
    paddingBottom: 16,
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
    marginVertical: 12,
  },
  versionText: {
    marginTop: 24,
    textAlign: "center",
    opacity: 0.6,
  },
});

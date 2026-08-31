import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { SettingItem } from "@/features/settings/components/SettingItem";

// Components
import { ThemeCard, ThemeOption } from "@/features/settings/components/ThemeCard";
import { AppIconItem } from "@/features/settings/components/AppIconItem";

// Icons
import StarBgIcon from "@/assets/icons/shared/starBg.svg";
import NightModeIcon from "@/assets/icons/settings/moon.svg";
import EmojiIcon from "@/assets/icons/settings/emoji.svg";

const THEME_OPTIONS: ThemeOption[] = [
  { id: "green", label: "Green", primaryColor: "#10B981", lightBg: "#F5FBF7", darkBg: "#0F2637" },
  { id: "blue", label: "Blue", primaryColor: "#007AFF", lightBg: "#EFF6FF", darkBg: "#0A1F33" },
  { id: "red", label: "Red", primaryColor: "#FF3B30", lightBg: "#FEF2F2", darkBg: "#330F10" },
  { id: "orange", label: "Orange", primaryColor: "#FF9500", lightBg: "#FFFBEB", darkBg: "#33210A" },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption["id"]>("green");
  const [nightMode, setNightMode] = useState(isDark);
  const [largeEmoji, setLargeEmoji] = useState(false);
  const [selectedAppIcon, setSelectedAppIcon] = useState("green");

  const activeThemeColor = THEME_OPTIONS.find((t) => t.id === selectedTheme)?.primaryColor || themeColors.primary;

  return (
    <View style={styles.container}>
      {/* Header */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Appearance"
          onBack={() => router.back()}
        />
      </MySafeAreaView>

      {/* Main Body */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 1. CHAT PREVIEW BOX */}
          <View style={[styles.previewBox, { backgroundColor: isDark ? "#0A1926" : "#F5FBF7" }]}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <StarBgIcon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" color={isDark ? "#122A3B" : "#E8F5ED"} />
            </View>

            {/* Left Chat Bubble */}
            <View style={styles.bubbleRowLeft}>
              <View style={[styles.chatBubbleLeft, { backgroundColor: isDark ? "#081C2C" : "#FFFFFF" }]}>
                <Typography size={14} color={themeColors.text}>
                  Habitant elit pellentesque curabitur morbi sit fusce elit
                </Typography>
              </View>
              <Typography size={12} color={themeColors.textSecondary} style={styles.timeText}>
                18:25
              </Typography>
            </View>

            {/* Right Chat Bubble */}
            <View style={styles.bubbleRowRight}>
              <Typography size={12} color={themeColors.textSecondary} style={styles.timeText}>
                19:40
              </Typography>
              <View style={[styles.chatBubbleRight, { backgroundColor: activeThemeColor }]}>
                <Typography size={14} color="white">
                  Gravida lectus semper orci
                </Typography>
              </View>
            </View>
          </View>

          {/* 2. SELECT A THEME */}
          <Typography size={16} weight="bold" color={themeColors.text} style={styles.sectionTitle}>
            Select a Theme
          </Typography>
          <View style={styles.rowGrid}>
            {THEME_OPTIONS.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={(id) => setSelectedTheme(id)}
              />
            ))}
          </View>

          {/* 3. TOGGLE SETTINGS */}
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={<NightModeIcon width={16} height={16} color={activeThemeColor} />}
              label="Night Mode"
              hasSwitch
              switchValue={nightMode}
              onSwitchChange={setNightMode}
              isDark={isDark}
              themeColors={themeColors}
            />
            <SettingItem
              icon={<EmojiIcon width={16} height={16} color={activeThemeColor} />}
              label="Large Emoji"
              hasSwitch
              switchValue={largeEmoji}
              onSwitchChange={setLargeEmoji}
              isDark={isDark}
              themeColors={themeColors}
            />
          </View>

          {/* 4. APP ICON SELECTOR */}
          <Typography size={16} weight="bold" color={themeColors.text} style={styles.sectionTitle}>
            App Icon
          </Typography>
          <View style={styles.rowGrid}>
            {THEME_OPTIONS.map((item) => (
              <AppIconItem
                key={item.id}
                id={item.id}
                label={item.label}
                isSelected={selectedAppIcon === item.id}
                onSelect={(id) => setSelectedAppIcon(id)}
              />
            ))}
          </View>

        </ScrollView>
      </MySafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    flex: 0,
  },
  bodySafeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  previewBox: {
    height: 180,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
    gap: 12,
  },
  bubbleRowLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingRight: 40,
  },
  chatBubbleLeft: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  bubbleRowRight: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 8,
    paddingLeft: 40,
  },
  chatBubbleRight: {
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  timeText: {
    marginBottom: 2,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  rowGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  settingsGroup: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
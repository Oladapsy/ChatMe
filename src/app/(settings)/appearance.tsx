import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { SettingItem } from "@/features/settings/components/SettingItem";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// Shared Theme Constants & Types
import { ICON_CONFIGS } from "@/shared/constants/theme";
import { IconThemeId } from "@/shared/types/theme";

// Components
import {
  ThemeCard,
  ThemeOption,
} from "@/features/settings/components/ThemeCard";
import { AppIconItem } from "@/features/settings/components/AppIconItem";

// Icons
import StarBgIcon from "@/assets/icons/chat/ChatBg.svg";
import NightModeIcon from "@/assets/icons/settings/moon.svg";
import EmojiIcon from "@/assets/icons/settings/emoji.svg";

// Dynamically construct THEME_OPTIONS using shared ICON_CONFIGS
const THEME_OPTIONS: ThemeOption[] = (
  Object.keys(ICON_CONFIGS) as IconThemeId[]
).map((id) => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
  primaryColor: ICON_CONFIGS[id].color,
  lightBg: ICON_CONFIGS[id].lightBg,
  darkBg: ICON_CONFIGS[id].darkBg,
}));

export default function AppearanceScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  const [selectedTheme, setSelectedTheme] = useState<IconThemeId>("green");
  const [nightMode, setNightMode] = useState(isDark);
  const [largeEmoji, setLargeEmoji] = useState(false);
  const [selectedAppIcon, setSelectedAppIcon] = useState<IconThemeId>("green");

  const activeThemeColor = ICON_CONFIGS[selectedTheme].color;

  return (
    <View style={styles.container}>
      {/* Header */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="Appearance" onBack={() => router.back()} />
      </MySafeAreaView>

      {/* Main Body */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* 1. CHAT PREVIEW BOX */}
          <View
            style={[
              styles.previewBox,
              {
                backgroundColor: isDark
                  ? ICON_CONFIGS[selectedTheme].darkBg
                  : ICON_CONFIGS[selectedTheme].lightBg,
              },
            ]}
          >
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <StarBgIcon
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                color={isDark ? "#122A3B" : "#E8F5ED"}
              />
            </View>

            {/* Left Chat Bubble */}
            <View style={styles.bubbleRowLeft}>
              <View
                style={[
                  styles.chatBubbleLeft,
                  { backgroundColor: isDark ? "#081C2C" : "#FFFFFF" },
                ]}
              >
                <Typography size={16} color={themeColors.text}>
                  Habitant elit pellentesque curabitur morbi sit fusce elit
                </Typography>
              </View>
              <Typography
                size={14}
                color={themeColors.textSecondary}
                style={styles.timeText}
              >
                18:25
              </Typography>
            </View>

            {/* Right Chat Bubble */}
            <View style={styles.bubbleRowRight}>
              <Typography
                size={14}
                color={themeColors.textSecondary}
                style={styles.timeText}
              >
                19:40
              </Typography>
              <View
                style={[
                  styles.chatBubbleRight,
                  { backgroundColor: activeThemeColor },
                ]}
              >
                <Typography size={16} color="white">
                  Gravida lectus semper orci
                </Typography>
              </View>
            </View>
          </View>

          {/* 2. SELECT A THEME */}
          <Typography
            size={18}
            weight="bold"
            color={isDark? themeColors.mediaTab: themeColors.descText}
            style={styles.sectionTitle}
          >
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

          {/* 3. TOGGLE SETTINGS NiGHT Mode and Large Emoji*/}
          <View style={styles.settingsGroup}>
            <SettingItem
              icon={
                <NightModeIcon
                  width={16}
                  height={16}
                  color={activeThemeColor}
                />
              }
              label="Night Mode"
              hasSwitch
              switchValue={nightMode}
              onSwitchChange={setNightMode}
              isDark={isDark}
              themeColors={themeColors}
            />

            <SettingItem
              icon={
                <EmojiIcon width={16} height={16} color={activeThemeColor} />
              }
              label="Large Emoji"
              hasSwitch
              switchValue={largeEmoji}
              onSwitchChange={setLargeEmoji}
              isDark={isDark}
              themeColors={themeColors}
            />
          </View>

          {/* 4. APP ICON SELECTOR */}
          <Typography
            size={18}
            weight="bold"
            color={isDark? themeColors.mediaTab: themeColors.descText}
            style={styles.sectionTitle}
          >
            App Icon
          </Typography>
          <View style={styles.rowGrid}>
            {THEME_OPTIONS.map((item) => (
              <AppIconItem
                key={item.id}
                id={item.id}
                label={item.label}
                isSelected={selectedAppIcon === item.id}
                onSelect={(id) => setSelectedAppIcon(id as IconThemeId)}
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
    marginBottom: 16,
  },
  rowGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  settingsGroup: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 1.5,
  },
});

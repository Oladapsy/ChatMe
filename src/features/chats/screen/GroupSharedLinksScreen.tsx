import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SectionList,
  SafeAreaView,
  useColorScheme,
  Linking,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import SearchIcon from "@/assets/icons/shared/search.svg";

export interface SharedLinkItem {
  id: string;
  title: string;
  url: string;
  iconUri?: string;
}

export interface SharedLinkSection {
  title: string; // e.g., "Today", "Yesterday", "26 Oct 2021"
  data: SharedLinkItem[];
}

interface Props {
  sections: SharedLinkSection[];
  onBack: () => void;
  onSelectTab: (tab: "Photo" | "Star" | "Links") => void;
  onSearchPress?: () => void;
}

export function GroupSharedLinksScreen({
  sections,
  onBack,
  onSelectTab,
  onSearchPress,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [activeTab, setActiveTab] = useState<"Photo" | "Star" | "Links">(
    "Links",
  );

  const handleTabPress = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
    onSelectTab(tab);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <BackIcon width={24} height={24} color={themeColors.text} />
        </TouchableOpacity>
        <Typography size={18} weight="bold" color={themeColors.text}>
          Shared Links
        </Typography>
        <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
          <SearchIcon width={20} height={20} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Category Segment Control */}
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: isDark ? "#122332" : "#F0F4F8" },
        ]}
      >
        {(["Photo", "Star", "Links"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentBtn,
                isActive && {
                  backgroundColor: isDark ? "#1E3447" : "#FFFFFF",
                },
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Typography
                size={14}
                weight={isActive ? "bold" : "medium"}
                color={isActive ? themeColors.text : themeColors.textSecondary}
              >
                {tab}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Date-Grouped Links List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Typography size={14} weight="bold" color={themeColors.text}>
              {title}
            </Typography>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.linkRow}
            activeOpacity={0.7}
            onPress={() => handleOpenUrl(item.url)}
          >
            <Image
              source={
                item.iconUri
                  ? { uri: item.iconUri }
                  : require("@/assets/images/default-avatar.png")
              }
              style={styles.linkIcon}
            />
            <View style={styles.linkDetails}>
              <Typography
                size={15}
                weight="bold"
                color={themeColors.text}
                numberOfLines={1}
              >
                {item.title}
              </Typography>
              <Typography
                size={13}
                color={themeColors.textSecondary}
                numberOfLines={1}
              >
                {item.url}
              </Typography>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 52,
  },
  iconBtn: {
    padding: 4,
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  linkDetails: {
    flex: 1,
    gap: 2,
  },
});

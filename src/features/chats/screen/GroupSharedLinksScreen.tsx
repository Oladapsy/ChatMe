import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  SectionList,
  useColorScheme,
  Linking,
} from "react-native";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import SearchIcon from "@/assets/icons/shared/search.svg";

export interface SharedLinkItem {
  id: string;
  title: string;
  url: string;
  iconUri?: string;
}

export interface SharedLinkSection {
  title: string;
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
    <View style={styles.container}>
      {/* 1. Top Safe Area for Status Bar + Header */}
      <MySafeAreaView
        edges={["top"]}
        color={themeColors.headBg}
        style={styles.topSafeArea}
      >
        <SubScreenHeader
          title="Shared Links"
          onBack={onBack}
          rightAction={
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <SearchIcon width={24} height={24} color={"white"} />
            </TouchableOpacity>
          }
        />
      </MySafeAreaView>

      {/* 2. Main Body Safe Area */}
      <MySafeAreaView
        edges={["bottom", "left", "right"]}
        color={themeColors.background}
        style={styles.bodySafeArea}
      >
        {/* Category Segment Control */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: isDark ? "#0F2637" : "#F5F7F9" },
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
                    backgroundColor: themeColors.mediaTabBg,
                  },
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Typography
                  size={14}
                  weight={isActive ? "bold" : "medium"}
                  color={themeColors.mediaTab}
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
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={[
                styles.sectionHeaderRow,
                { backgroundColor: themeColors.background },
              ]}
            >
              <Typography size={15} weight="bold" color={themeColors.text}>
                {title}
              </Typography>
              <View
                style={[
                  styles.headerLine,
                  { backgroundColor: isDark ? "#1E3447" : "#E2E8F0" },
                ]}
              />
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
                  color={isDark ? "#4EAD87" : "#10B981"}
                  numberOfLines={2}
                  style={styles.urlText}
                >
                  {item.url}
                </Typography>
              </View>
            </TouchableOpacity>
          )}
        />
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
  iconBtn: {
    padding: 4,
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  headerLine: {
    flex: 1,
    height: 1,
    opacity: 0.6,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 14,
  },
  linkIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  linkDetails: {
    flex: 1,
    gap: 4,
  },
  urlText: {
    lineHeight: 18,
  },
});

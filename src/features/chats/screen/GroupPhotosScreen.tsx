import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  useColorScheme,
  Dimensions,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";

const { width } = Dimensions.get("window");
const ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

interface Props {
  photos: string[];
  onBack: () => void;
  onSelectTab: (tab: "Photo" | "Star" | "Links") => void;
  onImagePress?: (uri: string) => void;
}

export function GroupPhotosScreen({
  photos,
  onBack,
  onSelectTab,
  onImagePress,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const [activeTab, setActiveTab] = useState<"Photo" | "Star" | "Links">(
    "Photo",
  );

  const handleTabPress = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
    onSelectTab(tab);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <BackIcon width={24} height={24} color={themeColors.text} />
        </TouchableOpacity>
        <Typography size={18} weight="bold" color={themeColors.text}>
          Photos
        </Typography>
        <View style={styles.placeholder} />
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

      {/* Photos Grid */}
      <FlatList
        data={photos}
        keyExtractor={(_, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onImagePress?.(item)}
          >
            <Image source={{ uri: item }} style={styles.photoThumb} />
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
  backBtn: {
    padding: 4,
  },
  placeholder: {
    width: 32,
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
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  columnWrapper: {
    gap: 8,
    marginBottom: 8,
  },
  photoThumb: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 12,
  },
});

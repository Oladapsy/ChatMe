import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { SubScreenHeader } from "@/shared/components/SubScreenHeader";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

const { width } = Dimensions.get("window");
const PADDING = 20;
const GAP = 8;
const AVAILABLE_WIDTH = width - PADDING * 2;

const HERO_HEIGHT = 190;
const THREE_COL_SIZE = (AVAILABLE_WIDTH - GAP * 2) / 3;
const TALL_WIDTH = (AVAILABLE_WIDTH - GAP) * 0.62;
const SMALL_STACK_WIDTH = (AVAILABLE_WIDTH - GAP) * 0.38;
const SMALL_STACK_HEIGHT = (HERO_HEIGHT - GAP) / 2;

interface Props {
  photos: string[];
  onBack: () => void;
  onSelectTab: (tab: "Photo" | "Star" | "Links") => void;
  onImagePress?: (uri: string) => void;
}

export function ChatPhotosScreen({
  photos,
  onBack,
  onSelectTab,
  onImagePress,
}: Props) {
  const { isDark, themeColors } = useAppTheme();

  const [activeTab, setActiveTab] = useState<"Photo" | "Star" | "Links">(
    "Photo",
  );

  const handleTabPress = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
    onSelectTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Safe Area for Status Bar + Header only */}
      <MySafeAreaView
        edges={["top"]}
        color={isDark ? themeColors.headBg : themeColors.primary}
        style={styles.topSafeArea}
      >
        <SubScreenHeader title="Photos" onBack={onBack} />
      </MySafeAreaView>

      {/* 2. Main Content Safe Area (Bottom, Left, Right) */}
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

        {/* Dynamic Photo Gallery Collage */}
        <ScrollView
          contentContainerStyle={styles.galleryContent}
          showsVerticalScrollIndicator={false}
        >
          {photos[0] && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onImagePress?.(photos[0])}
            >
              <Image source={{ uri: photos[0] }} style={styles.heroImage} />
            </TouchableOpacity>
          )}

          {photos.length > 1 && (
            <View style={styles.threeColumnRow}>
              {photos.slice(1, 4).map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => onImagePress?.(uri)}
                >
                  <Image source={{ uri }} style={styles.threeColImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {photos.length > 4 && (
            <View style={styles.splitRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onImagePress?.(photos[4])}
              >
                <Image source={{ uri: photos[4] }} style={styles.tallImage} />
              </TouchableOpacity>

              <View style={styles.stackedColumn}>
                {photos.slice(5, 7).map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => onImagePress?.(uri)}
                  >
                    <Image source={{ uri }} style={styles.smallStackedImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {photos.length > 7 && (
            <View style={styles.remainingGrid}>
              {photos.slice(7).map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => onImagePress?.(uri)}
                >
                  <Image source={{ uri }} style={styles.threeColImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: PADDING,
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
  galleryContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 24,
    gap: GAP,
  },
  heroImage: {
    width: AVAILABLE_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 16,
  },
  threeColumnRow: {
    flexDirection: "row",
    gap: GAP,
  },
  threeColImage: {
    width: THREE_COL_SIZE,
    height: THREE_COL_SIZE,
    borderRadius: 12,
  },
  splitRow: {
    flexDirection: "row",
    gap: GAP,
  },
  tallImage: {
    width: TALL_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 16,
  },
  stackedColumn: {
    width: SMALL_STACK_WIDTH,
    gap: GAP,
  },
  smallStackedImage: {
    width: "100%",
    height: SMALL_STACK_HEIGHT,
    borderRadius: 12,
  },
  remainingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
});

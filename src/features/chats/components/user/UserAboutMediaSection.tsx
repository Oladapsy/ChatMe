import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

import ImageIcon from "@/assets/icons/shared/allPhotos.svg";
import StarIcon from "@/assets/icons/shared/star.svg";
import LinkIcon from "@/assets/icons/shared/link.svg";
import BellIcon from "@/assets/icons/shared/volume.svg";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

interface Props {
  photoCount: number;
  starCount: number;
  linkCount: number;
  isMuted: boolean;
  previewPhotos?: string[];
  onPhotosPress: () => void;
  onStarredPress: () => void;
  onLinksPress: () => void;
  onToggleNotifications: (value: boolean) => void;
}

export function UserAboutMediaSection({
  photoCount,
  starCount,
  linkCount,
  isMuted,
  previewPhotos,
  onPhotosPress,
  onStarredPress,
  onLinksPress,
  onToggleNotifications,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];
  const accentColor = themeColors.primary;

  return (
    <View
      style={[styles.aboutSection, { backgroundColor: themeColors.background }]}
    >
      <Typography
        size={17}
        weight="bold"
        color={themeColors.text}
        style={styles.sectionTitle}
      >
        About
      </Typography>

      {/* Photos Row Preview */}
      <TouchableOpacity
        style={styles.mediaHeaderRow}
        activeOpacity={0.7}
        onPress={onPhotosPress}
      >
        <View style={styles.mediaTitleLeft}>
          <ImageIcon width={22} height={22} color={accentColor} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {photoCount} photos
          </Typography>
        </View>
        <ChevronRightIcon
          width={20}
          height={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Photo Horizontal Preview Strip */}
      {previewPhotos && previewPhotos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoStrip}
        >
          {previewPhotos.slice(0, 5).map((url, idx) => (
            <Image
              key={`${url}-${idx}`}
              source={{ uri: url }}
              style={styles.photoThumb}
            />
          ))}
        </ScrollView>
      )}

      {/* Starred Messages Row */}
      <TouchableOpacity
        style={styles.navRow}
        activeOpacity={0.7}
        onPress={onStarredPress}
      >
        <View style={styles.mediaTitleLeft}>
          <StarIcon width={22} height={22} color={accentColor} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {starCount} star messages
          </Typography>
        </View>
        <ChevronRightIcon
          width={20}
          height={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Shared Links Row */}
      <TouchableOpacity
        style={styles.navRow}
        activeOpacity={0.7}
        onPress={onLinksPress}
      >
        <View style={styles.mediaTitleLeft}>
          <LinkIcon width={22} height={22} color={accentColor} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {linkCount} shared links
          </Typography>
        </View>
        <ChevronRightIcon
          width={20}
          height={20}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Controlled Notifications Toggle */}
      <View style={styles.navRow}>
        <View style={styles.mediaTitleLeft}>
          <BellIcon width={24} height={24} color={accentColor} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            Notifications
          </Typography>
        </View>
        <Switch
          value={!isMuted}
          onValueChange={onToggleNotifications}
          trackColor={{
            false: isDark ? "#2C3E50" : "#D1D5DB",
            true: Colors.light.primary,
          }}
          thumbColor={isDark ? "#FFFFFF" : "#FFFFFF"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  mediaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  mediaTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoStrip: {
    gap: 10,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  photoThumb: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
});

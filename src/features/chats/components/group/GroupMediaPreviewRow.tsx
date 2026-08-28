import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import PhotoIcon from "@/assets/icons/shared/cameraPlus.svg";
import StarIcon from "@/assets/icons/shared/star.svg";
import LinkIcon from "@/assets/icons/shared/link.svg";
import ChevronRight from "@/assets/icons/shared/chevron-right.svg";

interface Props {
  photosCount: number;
  starCount: number;
  linksCount: number;
  recentPhotos: string[];
  onPressPhotos: () => void;
  onPressStars: () => void;
  onPressLinks: () => void;
}

export function GroupMediaPreviewRow({
  photosCount,
  starCount,
  linksCount,
  recentPhotos,
  onPressPhotos,
  onPressStars,
  onPressLinks,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.container}>
      {/* Photos Navigation Section */}
      <TouchableOpacity style={styles.rowItem} onPress={onPressPhotos}>
        <View style={styles.leftMeta}>
          <PhotoIcon width={20} height={20} color={themeColors.primary} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {photosCount} photos
          </Typography>
        </View>
        <ChevronRight
          width={18}
          height={18}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Horizontal Image Thumbnails Preview */}
      {recentPhotos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbsContainer}
        >
          {recentPhotos.slice(0, 5).map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.thumbImage} />
          ))}
        </ScrollView>
      )}

      {/* Star Messages Navigation Section */}
      <TouchableOpacity style={styles.rowItem} onPress={onPressStars}>
        <View style={styles.leftMeta}>
          <StarIcon width={20} height={20} color={themeColors.primary} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {starCount} star messages
          </Typography>
        </View>
        <ChevronRight
          width={18}
          height={18}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>

      {/* Shared Links Navigation Section */}
      <TouchableOpacity style={styles.rowItem} onPress={onPressLinks}>
        <View style={styles.leftMeta}>
          <LinkIcon width={20} height={20} color={themeColors.primary} />
          <Typography size={15} weight="medium" color={themeColors.text}>
            {linksCount} shared links
          </Typography>
        </View>
        <ChevronRight
          width={18}
          height={18}
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  leftMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumbsContainer: {
    gap: 8,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  thumbImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
});

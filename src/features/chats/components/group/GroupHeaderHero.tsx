import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";
import SearchIcon from "@/assets/icons/shared/search.svg";
import QrIcon from "@/assets/icons/chat/qrcode.svg";
import MySafeAreaView from "@/shared/components/MySafeAreaView";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  name: string;
  coverImageUri?: string;
  onBack: () => void;
  onSearch?: () => void;
  onShowQR?: () => void;
  onEdit?: () => void;
}

export function GroupHeaderHero({
  name,
  coverImageUri,
  onBack,
  onSearch,
  onShowQR,
  onEdit,
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={
          coverImageUri
            ? { uri: coverImageUri }
            : require("@/assets/images/group/placeholderGroup.png")
        }
        style={styles.coverImage}
        resizeMode="cover"
      />

      <View style={styles.overlay} />

      <MySafeAreaView style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
          <BackIcon width={20} height={20} color="white" />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit group"
            >
              <Typography size={14} weight="semibold" color="white">
                Edit
              </Typography>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
            <SearchIcon width={24} height={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={onShowQR}>
            <QrIcon width={24} height={24} color="white" />
          </TouchableOpacity>
        </View>
      </MySafeAreaView>

      <View style={styles.titleContainer}>
        <Typography
          size={28}
          weight="bold"
          color="white"
          style={styles.titleText}
        >
          {name}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 270,
    width: "100%",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000000A3",
    justifyContent: "center",
    alignItems: "center",
  },
  editBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#000000A3",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  titleText: {
    lineHeight: 34,
  },
});

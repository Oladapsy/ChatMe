import React from "react";
import { StyleSheet, View, TouchableOpacity, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// SVG Icons
import CloseIcon from "@/assets/icons/shared/close.svg";
import PinIcon from "@/assets/icons/shared/pin.svg";
import MuteIcon from "@/assets/icons/shared/mute.svg";
import ArchiveIcon from "@/assets/icons/shared/archive.svg";
import TrashIcon from "@/assets/icons/shared/trash.svg";

interface SelectionHeaderProps {
  selectedCount: number;
  onClearSelection: () => void;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function SelectionHeader({
  selectedCount,
  onClearSelection,
  onPin,
  onMute,
  onArchive,
  onDelete,
}: SelectionHeaderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.primary }]}>
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={onClearSelection} activeOpacity={0.7}>
          <CloseIcon width={22} height={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Typography variant="h2" size={18} weight="bold" color="#FFFFFF">
          Chats • {selectedCount}
        </Typography>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity onPress={onPin} activeOpacity={0.7}>
          <PinIcon width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMute} activeOpacity={0.7}>
          <MuteIcon width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onArchive} activeOpacity={0.7}>
          <ArchiveIcon width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
          <TrashIcon width={20} height={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
});
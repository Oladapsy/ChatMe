import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// SVG Icons
import CloseIcon from "@/assets/icons/chat/close.svg";
import PinIcon from "@/assets/icons/chat/pin.svg";
import MuteIcon from "@/assets/icons/chat/mute.svg";
import ArchiveIcon from "@/assets/icons/chat/archive.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

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
  const { isDark, themeColors } = useAppTheme();


  // header bg color
  const headerBgColor = isDark
    ? themeColors.onboardingTop
    : themeColors.primary;

  return (
    <View style={[styles.container, { backgroundColor: headerBgColor }]}>
      <View style={styles.leftRow}>
        <TouchableOpacity onPress={onClearSelection} activeOpacity={0.7}>
          <CloseIcon width={22} height={22} color="white" />
        </TouchableOpacity>
        <Typography variant="h2" size={20} weight="bold" color="white">
          Chats • {selectedCount}
        </Typography>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity onPress={onPin} activeOpacity={0.7}>
          <PinIcon width={20} height={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onMute} activeOpacity={0.7}>
          <MuteIcon width={20} height={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onArchive} activeOpacity={0.7}>
          <ArchiveIcon width={20} height={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} activeOpacity={0.7}>
          <TrashIcon width={20} height={20} color="white" />
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

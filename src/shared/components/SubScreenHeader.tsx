import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import BackIcon from "@/assets/icons/shared/chevron-left.svg";

interface Props {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
}

export function SubScreenHeader({
  title,
  onBack,
  showBackButton = true,
  rightAction,
}: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.header, { backgroundColor: themeColors.headBg }]}>
      {/* Left Slot: Back Button or Alignment Placeholder */}
      <View style={styles.leftSlot}>
        {showBackButton && onBack ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <BackIcon width={24} height={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Center Title */}
      <Typography size={18} weight="bold" color="white">
        {title}
      </Typography>

      {/* Right Action Slot */}
      <View style={styles.rightActionSlot}>
        {rightAction ?? <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 64,
  },
  leftSlot: {
    minWidth: 32,
    alignItems: "flex-start",
  },
  iconBtn: {
    padding: 4,
  },
  rightActionSlot: {
    minWidth: 32,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 24,
  },
});
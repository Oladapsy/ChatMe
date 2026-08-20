import React, { FC } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { SvgProps } from "react-native-svg";

import { Typography } from "@/shared/components/Typography";

interface SwipeActionButtonProps {
  label: string;
  icon: FC<SvgProps>;
  backgroundColor: string;
  textColor?: string;
  isCompact?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function SwipeActionButton({
  label,
  icon: Icon,
  backgroundColor,
  textColor = "white",
  isCompact = false,
  onPress,
  style,
}: SwipeActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon width={20} height={20} color={textColor} />
      <Typography
        size={isCompact ? 11 : 13}
        color={textColor}
        weight="bold"
        style={styles.actionText}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    marginTop: 4,
  },
});

import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

interface BlockedContactItemProps {
  name: string;
  phone: string;
  avatarUrl: string;
  onPress: () => void;
  isDark?: boolean;
  themeColors: any;
}

export function BlockedContactItem({
  name,
  phone,
  avatarUrl,
  onPress,
  isDark,
  themeColors,
}: BlockedContactItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />

      <View style={styles.info}>
        <Typography size={16} weight="bold" color={themeColors.text}>
          {name}
        </Typography>
        <Typography size={13} color={themeColors.textSecondary}>
          {phone}
        </Typography>
      </View>

      <ChevronRightIcon
        width={16}
        height={16}
        color={isDark ? themeColors.descText : "#8EA3B3"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
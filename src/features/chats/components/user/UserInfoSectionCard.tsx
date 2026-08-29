import React from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

interface Props {
  phone: string;
  description: string;
}

export function UserInfoSectionCard({ phone, description }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View
      style={[styles.infoSection, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.infoRow}>
        <Typography size={16} weight="bold" color={themeColors.modalText}>
          {phone}
        </Typography>
        <Typography size={14} color={themeColors.mute}>
          Phone number
        </Typography>
      </View>

      <View style={styles.infoRow}>
        <Typography size={16} weight="bold" color={themeColors.modalText}>
          {description}
        </Typography>
        <Typography size={14} color={themeColors.mute}>
          Description
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  infoRow: {
    gap: 2,
  },
});

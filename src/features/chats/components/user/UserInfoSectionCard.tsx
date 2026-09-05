import React from "react";
import { StyleSheet, View } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  phone: string;
  description: string;
}

export function UserInfoSectionCard({ phone, description }: Props) {
      const { isDark, themeColors } = useAppTheme();


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

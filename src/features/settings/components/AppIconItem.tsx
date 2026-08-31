import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// Shared imports
import { IconThemeId } from "@/shared/types/theme";
import { ICON_CONFIGS } from "@/shared/constants/theme";

// Icons
import AppIcon from "@/assets/icons/settings/appIcon.svg";

interface AppIconItemProps {
  id: IconThemeId;
  label: string;
  isSelected: boolean;
  onSelect: (id: IconThemeId) => void;
}

export function AppIconItem({
  id,
  label,
  isSelected,
  onSelect,
}: AppIconItemProps) {
  const { isDark, themeColors } = useAppTheme();
  const config = ICON_CONFIGS[id];

  const containerBg = isDark ? config.darkBg : config.lightBg;

  const labelColor = isSelected
    ? config.color
    : isDark
    ? themeColors.textSecondary
    : "#8EA3B3";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(id)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconCard,
          { backgroundColor: containerBg },
          isSelected && {
            borderWidth: 1.5,
            borderColor: config.color,
          },
        ]}
      >
        <AppIcon width={48} height={48} color={config.color} />
      </View>

      <Typography size={12} weight="medium" color={labelColor} align="center">
        {label}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  iconCard: {
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
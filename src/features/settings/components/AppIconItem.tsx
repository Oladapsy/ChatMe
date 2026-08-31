import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// Icons
import AppIcon from "@/assets/icons/settings/appIcon.svg";

export type IconThemeId = "green" | "blue" | "red" | "orange";

interface AppIconConfig {
  color: string;
  lightBg: string;
  darkBg: string;
}

const ICON_CONFIGS: Record<IconThemeId, AppIconConfig> = {
  green: { color: "#57B77D", lightBg: "#F5FBF7", darkBg: "#0F2B22" },
  blue: { color: "#007CFF", lightBg: "#ECF5FF", darkBg: "#0A2440" },
  red: { color: "#E8503A", lightBg: "#FFF5F5", darkBg: "#3B1416" },
  orange: { color: "#FFB23F", lightBg: "#FFF0D9", darkBg: "#3D230A" },
};

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

  // Dynamic Background: Light/Dark Mode + Color Spec
  const containerBg = isDark ? config.darkBg : config.lightBg;

  // Active label to match label
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

      {/* Dynamic Colored Label */}
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

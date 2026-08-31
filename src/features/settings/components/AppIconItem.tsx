import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";

// Icons
import AppIcon from "@/assets/icons/settings/appIcon.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface AppIconItemProps {
  id: "green" | "blue" | "red" | "orange";
  label: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AppIconItem({
  id,
  label,
  isSelected,
  onSelect,
}: AppIconItemProps) {
  const { themeColors } = useAppTheme();
  const renderIcon = () => {
    switch (id) {
      case "green":
        return <AppIcon width={48} height={48} color={themeColors.primary} />;
      case "blue":
        return <AppIcon width={48} height={48} color={themeColors.blue} />;
      case "red":
        return <AppIcon width={48} height={48} color={themeColors.red} />;
      case "orange":
        return <AppIcon width={48} height={48} color={themeColors.orange} />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onSelect(id)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, isSelected && styles.selectedBorder]}>
        {renderIcon()}
      </View>
      <Typography
        size={12}
        weight="medium"
        color={isSelected ? "#10B981" : "#112519"}
        align="center"
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 4,
  },
  iconWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  selectedBorder: {
    borderWidth: 1.5,
    borderColor: "#10B981",
  },
});

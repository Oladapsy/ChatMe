import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import CheckIcon from "@/assets/icons/shared/check.svg";
import { IconThemeId } from "@/shared/types/theme";

export interface ThemeOption {
  id: IconThemeId;
  label: string;
  primaryColor: string;
  lightBg: string;
  darkBg: string;
}

interface ThemeCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  onSelect: (id: IconThemeId) => void;
}

export function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  const { isDark } = useAppTheme();
  const containerBg = isDark ? theme.darkBg : theme.lightBg;

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { backgroundColor: containerBg },
        isSelected && { borderColor: theme.primaryColor, borderWidth: 1.5 },
      ]}
      onPress={() => onSelect(theme.id)}
      activeOpacity={0.8}
    >
      {/* Check Badge */}
      {isSelected && (
        <View
          style={[styles.checkBadge, { backgroundColor: theme.primaryColor }]}
        >
          <CheckIcon width={10} height={10} color="white" />
        </View>
      )}

      {/* Mini Chat Bubbles Preview */}
      <View style={styles.previewArea}>
        <View
          style={[styles.bubbleRight, { backgroundColor: theme.primaryColor }]}
        />
        <View
          style={[
            styles.bubbleLeft,
            { backgroundColor: isDark ? "#081C2C" : "#FFFFFF" },
          ]}
        />
      </View>

      {/* Label Footer */}
      <View
        style={[
          styles.labelBox,
          {
            backgroundColor: isSelected ? theme.primaryColor : "transparent",
          },
        ]}
      >
        <Typography
          size={12}
          weight="medium"
          color={isSelected ? "white" : theme.primaryColor}
          align="center"
        >
          {theme.label}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 68,
    height: 84,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "space-between",
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  previewArea: {
    flex: 1,
    padding: 10,
    gap: 6,
    justifyContent: "center",
  },
  bubbleRight: {
    width: 32,
    height: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  bubbleLeft: {
    width: 32,
    height: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  labelBox: {
    paddingVertical: 5,
    alignItems: "center",
  },
});

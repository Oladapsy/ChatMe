import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import CheckIcon from "@/assets/icons/shared/check.svg"; // or checkmark icon

export interface ThemeOption {
  id: "green" | "blue" | "red" | "orange";
  label: string;
  primaryColor: string;
  lightBg: string;
  darkBg: string;
}

interface ThemeCardProps {
  theme: ThemeOption;
  isSelected: boolean;
  onSelect: (id: ThemeOption["id"]) => void;
}

export function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { backgroundColor: isDark ? "#0A1F2D" : "#F8FAFC" },
        isSelected && { borderColor: theme.primaryColor, borderWidth: 1.5 },
      ]}
      onPress={() => onSelect(theme.id)}
      activeOpacity={0.8}
    >
      {/* Selection Check Badge */}
      {isSelected && (
        <View
          style={[styles.checkBadge, { backgroundColor: theme.primaryColor }]}
        >
          <CheckIcon width={10} height={10} color="white" />
        </View>
      )}

      {/* Card Preview Graphic */}
      <View style={styles.previewArea}>
        <View
          style={[styles.bubbleRight, { backgroundColor: theme.primaryColor }]}
        />
        <View
          style={[
            styles.bubbleLeft,
            { backgroundColor: isDark ? "#163043" : "#FFFFFF" },
          ]}
        />
      </View>

      {/* Label Box */}
      <View
        style={[
          styles.labelBox,
          isSelected && { backgroundColor: theme.primaryColor },
        ]}
      >
        <Typography
          size={12}
          weight="bold"
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
    width: 72,
    height: 88,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
  },
  checkBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  previewArea: {
    flex: 1,
    padding: 8,
    gap: 6,
    justifyContent: "center",
  },
  bubbleRight: {
    width: 36,
    height: 10,
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  bubbleLeft: {
    width: 36,
    height: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  labelBox: {
    paddingVertical: 6,
    alignItems: "center",
  },
});

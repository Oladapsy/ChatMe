import React from "react";
import { StyleSheet, View } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface StorageUsageBarProps {
  usedMb: string;
  freeGb: string;
}

export function StorageUsageBar({ usedMb, freeGb }: StorageUsageBarProps) {
  const { isDark, themeColors } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Visual Bar */}

      {/* Text at top */}
      <Typography
        size={16}
        color={themeColors.text}
        style={{ marginBottom: 12 }}
      >
        Storage
      </Typography>
      <View
        style={[
          styles.barTrack,
          { backgroundColor: isDark ? "#1F3C51" : "#EAEEF2" },
        ]}
      >
        <View
          style={[styles.barFill, { backgroundColor: themeColors.primary }]}
        />
      </View>

      {/* Breakdown Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.dot, { backgroundColor: themeColors.primary }]}
          />
          <Typography size={14} color={themeColors.text}>
            {`Media and Files \u2022 ${usedMb}`}
          </Typography>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isDark ? "#607274" : "#94A3B8" },
            ]}
          />
          <Typography
            size={14}
            color={isDark ? themeColors.descText : "#64748B"}
          >
            {`Free \u2022 ${freeGb}`}
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  barTrack: {
    height: 24,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  barFill: {
    height: "100%",
    width: "25%",
    borderRadius: 6,
  },
  legendRow: {
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

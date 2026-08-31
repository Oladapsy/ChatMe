import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import CheckIcon from "@/assets/icons/shared/check.svg";

interface RadioSelectionRowProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  showDivider?: boolean;
  isDark?: boolean;
  themeColors: any;
}

export function RadioSelectionRow({
  label,
  isSelected,
  onSelect,
  showDivider = true,
  isDark,
  themeColors,
}: RadioSelectionRowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={onSelect}
        activeOpacity={0.7}
      >
        <Typography size={16} weight="medium" color={themeColors.text}>
          {label}
        </Typography>

        {isSelected ? (
          <View
            style={[
              styles.filledBadge,
              { backgroundColor: themeColors.primary },
            ]}
          >
            <CheckIcon width={12} height={12} color="white" />
          </View>
        ) : (
          <View
            style={[
              styles.emptyBadge,
              { borderColor: isDark ? "#1A364A" : "#E2E8F0" },
            ]}
          />
        )}
      </TouchableOpacity>

      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#122736" : "#F0F4F7" },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
  },
  row: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 20,
  },
  filledBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

interface PrivacyRowItemProps {
  label: string;
  value?: string;
  onPress: () => void;
  showDivider?: boolean;
  isDark?: boolean;
  themeColors: any;
}

export function PrivacyRowItem({
  label,
  value,
  onPress,
  showDivider = true,
  isDark,
  themeColors,
}: PrivacyRowItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Typography size={16} weight="medium" color={themeColors.text}>
          {label}
        </Typography>

        <View style={styles.rightSlot}>
          {value ? (
            <Typography
              size={14}
              color={isDark ? themeColors.descText : "#6E8597"}
            >
              {value}
            </Typography>
          ) : null}
          <ChevronRightIcon
            width={16}
            height={16}
            color={isDark ? themeColors.descText : "#6E8597"}
          />
        </View>
      </TouchableOpacity>
      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#3A566A" : "#F0F4F7" },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});

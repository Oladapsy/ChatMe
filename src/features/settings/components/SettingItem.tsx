import React from "react";
import { StyleSheet, View, TouchableOpacity, Switch } from "react-native";
import { Typography } from "@/shared/components/Typography";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  textColor?: string;
  isDark?: boolean;
  themeColors: any;
}

export function SettingItem({
  icon,
  label,
  onPress,
  showChevron = true,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  textColor,
  isDark,
  themeColors,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={hasSwitch || !onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#F0FDF4",
            },
          ]}
        >
          {icon}
        </View>
        <Typography
          size={16}
          weight="medium"
          color={textColor || themeColors.text}
          style={styles.label}
        >
          {label}
        </Typography>
      </View>

      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{
            false: isDark ? "#334155" : "#E2E8F0",
            true: themeColors.primary,
          }}
          thumbColor="white"
        />
      ) : (
        showChevron && (
          <ChevronRightIcon
            width={20}
            height={20}
            color={isDark ? "#64748B" : "#94A3B8"}
          />
        )
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  label: {
    fontSize: 16,
  },
});

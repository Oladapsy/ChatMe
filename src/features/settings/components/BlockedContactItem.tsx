import React from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";

import { Typography } from "@/shared/components/Typography";

interface BlockedContactItemProps {
  name: string;
  phone?: string;
  avatarUrl?: string | null;
  onPress: () => void;
  isDark?: boolean;
  themeColors: any;
  isUnblocking?: boolean;
}

export function BlockedContactItem({
  name,
  phone,
  avatarUrl,
  onPress,
  isDark,
  themeColors,
  isUnblocking = false,
}: BlockedContactItemProps) {
  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.avatarFallback,
            { backgroundColor: isDark ? "#30343B" : "#E8EEF3" },
          ]}
        >
          <Typography size={20} weight="bold" color={themeColors.text}>
            {name.trim().charAt(0).toUpperCase() || "?"}
          </Typography>
        </View>
      )}

      <View style={styles.info}>
        <Typography size={16} weight="bold" color={themeColors.text}>
          {name}
        </Typography>

        {!!phone && (
          <Typography size={14} color={themeColors.textSecondary}>
            {phone}
          </Typography>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.unblockButton,
          {
            borderColor: isDark ? "#505761" : "#D8E1E8",
          },
        ]}
        onPress={onPress}
        disabled={isUnblocking}
        activeOpacity={0.7}
      >
        <Typography size={13} weight="bold" color={themeColors.primary}>
          {isUnblocking ? "Unblocking..." : "Unblock"}
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
    marginRight: 10,
  },
  unblockButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
});

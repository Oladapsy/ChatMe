import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { Chat } from "@/features/chats/types/chat";
import PinIcon from "@/assets/icons/shared/pin.svg";

interface ChatListItemProps {
  chat: Chat;
  isSelected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function ChatListItem({
  chat,
  isSelected,
  onPress,
  onLongPress,
}: ChatListItemProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && { backgroundColor: isDark ? "#1F3C51" : "#E5E7EB" },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Avatar Container with Online Badge */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.isOnline && <View style={styles.onlineBadge} />}
      </View>

      {/* Main Info */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Typography variant="body" weight="bold" color={themeColors.text}>
            {chat.name}
          </Typography>
          <Typography
            size={12}
            color={chat.unreadCount ? themeColors.primary : themeColors.textSecondary}
          >
            {chat.time}
          </Typography>
        </View>

        <View style={styles.bottomRow}>
          <Typography
            size={13}
            color={themeColors.textSecondary}
            numberOfLines={1}
            style={styles.lastMessage}
          >
            {chat.lastMessage}
          </Typography>

          {/* Badges: Unread Counter or Pin Icon */}
          {chat.unreadCount ? (
            <View style={[styles.badge, { backgroundColor: themeColors.primary }]}>
              <Typography size={11} weight="bold" color="#FFFFFF">
                {chat.unreadCount}
              </Typography>
            </View>
          ) : chat.isPinned ? (
            <PinIcon width={16} height={16} color={themeColors.textSecondary} />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  infoContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});
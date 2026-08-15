import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { Chat } from "@/features/chats/types/chat";
import PinIcon from "@/assets/icons/shared/pin.svg";
import GroupIcon from "@/assets/icons/chat/user-group.svg";
import MutedIcon from "@/assets/icons/chat/mute.svg";


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
        isSelected && { backgroundColor: themeColors.longPress },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Avatar Container with Online Badge */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.isOnline && !chat.isGroup && <View style={styles.onlineBadge} />}
      </View>

      {/* Main Info */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <View style={styles.nameWrapper}>
            {chat.isGroup && (
              <GroupIcon width={18} height={18} color={themeColors.primary} />
            )}
            <Typography
              variant="body"
              size={16}
              weight="bold"
              color={themeColors.text}
            >
              {chat.name}
            </Typography>
            {chat.isMuted && (
              <MutedIcon width={18} height={18} color={themeColors.mute}/>
            )}
          </View>
          <Typography
            size={14}
            color={
              chat.unreadCount ? themeColors.primary : themeColors.textSecondary
            }
          >
            {chat.time}
          </Typography>
        </View>

        <View style={styles.bottomRow}>
          <Typography
            size={15}
            color={themeColors.textSecondary}
            numberOfLines={1}
            style={styles.lastMessage}
          >
            {chat.lastMessage}
          </Typography>

          {/* Badges: Unread Counter or Pin Icon */}
          {chat.unreadCount ? (
            <View
              style={[styles.badge, { backgroundColor: themeColors.primary }]}
            >
              <Typography size={13} weight="bold" color="white">
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
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.dark.primary,
    borderWidth: 2,
    borderColor: "white",
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
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
    height: 21,
    borderRadius: 10.25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
});

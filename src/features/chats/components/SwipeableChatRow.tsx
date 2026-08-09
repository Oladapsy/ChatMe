import React, { useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";

import { ChatListItem } from "@/features/chats/components/ChatListItem";
import { Chat } from "@/features/chats/types/chat";
import { Colors } from "@/shared/constants/colors";
import { Typography } from "@/shared/components/Typography";

// SVG Icons
import PinIcon from "@/assets/icons/chat/pin.svg";
import MuteIcon from "@/assets/icons/chat/mute.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";
import ArchiveIcon from "@/assets/icons/chat/archive.svg";
import MoreIcon from "@/assets/icons/chat/more.svg";

interface SwipeableChatRowProps {
  chat: Chat;
  isSelected?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onPin: (chat: Chat) => void;
  onMute: (chat: Chat) => void;
  onArchive: (chat: Chat) => void;
  onDelete: (chat: Chat) => void;
  onMore?: (chat: Chat) => void;
}

export function SwipeableChatRow({
  chat,
  isSelected,
  onPress,
  onLongPress,
  onPin,
  onMute,
  onArchive,
  onDelete,
  onMore,
}: SwipeableChatRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const closeSwipe = () => {
    swipeableRef.current?.close();
  };

  // Render Left Swipe Actions (Mute, Pin)
  const renderLeftActions = (
    _progress: SharedValue<number>,
    _dragX: SharedValue<number>,
  ) => {
    return (
      <View style={styles.leftActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
          onPress={() => {
            closeSwipe();
            onMute(chat);
          }}
        >
          <MuteIcon width={20} height={20} color="#FFFFFF" />
          <Typography
            size={11}
            color="#FFFFFF"
            weight="bold"
            style={styles.actionText}
          >
            {chat.isMuted ? "Unmute" : "Mute"}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? "#2D4B63" : "#9CA3AF" },
          ]}
          onPress={() => {
            closeSwipe();
            onPin(chat);
          }}
        >
          <PinIcon width={20} height={20} color="#FFFFFF" />
          <Typography
            size={11}
            color="#FFFFFF"
            weight="bold"
            style={styles.actionText}
          >
            {chat.isPinned ? "Unpin" : "Pin"}
          </Typography>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Right Swipe Actions (Delete, Archive, More)
  const renderRightActions = (
    _progress: SharedValue<number>,
    _dragX: SharedValue<number>,
  ) => {
    return (
      <View style={styles.rightActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
          onPress={() => {
            closeSwipe();
            onDelete(chat);
          }}
        >
          <TrashIcon width={20} height={20} color="#FFFFFF" />
          <Typography
            size={11}
            color="#FFFFFF"
            weight="bold"
            style={styles.actionText}
          >
            Delete
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? "#2D4B63" : "#9CA3AF" },
          ]}
          onPress={() => {
            closeSwipe();
            onArchive(chat);
          }}
        >
          <ArchiveIcon width={20} height={20} color="#FFFFFF" />
          <Typography
            size={11}
            color="#FFFFFF"
            weight="bold"
            style={styles.actionText}
          >
            Archive
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? "#1F3C51" : "#E5E7EB" },
          ]}
          onPress={() => {
            closeSwipe();
            onMore?.(chat);
          }}
        >
          <MoreIcon width={20} height={20} color={themeColors.text} />
          <Typography
            size={11}
            color={themeColors.text}
            weight="bold"
            style={styles.actionText}
          >
            More
          </Typography>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <ChatListItem
        chat={chat}
        isSelected={isSelected}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftActionsContainer: {
    flexDirection: "row",
    width: 140,
  },
  rightActionsContainer: {
    flexDirection: "row",
    width: 210,
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  actionText: {
    marginTop: 4,
  },
});

import { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";

import { ChatListItem } from "@/features/chats/components/ChatListItem";
import { Chat } from "@/features/chats/types/chat";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";

// SVG Icons
import ArchiveIcon from "@/assets/icons/chat/archive.svg";
import MoreIcon from "@/assets/icons/chat/more.svg";
import MuteIcon from "@/assets/icons/chat/mute.svg";
import PinIcon from "@/assets/icons/chat/pin.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";

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
  const [isSwiped, setIsSwiped] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const closeSwipe = () => {
    swipeableRef.current?.close();
  };

  const handleAction = (actionFn?: (chat: Chat) => void) => {
    closeSwipe();
    if (actionFn) {
      requestAnimationFrame(() => {
        actionFn(chat);
      });
    }
  };

  // Render Left Swipe Actions (Mute, Pin)
  const renderLeftActions = (
    _progress: SharedValue<number>,
    _dragX: SharedValue<number>,
  ) => {
    return (
      <View style={styles.leftActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#E8A13A" }]}
          onPress={() => handleAction(onMute)}
        >
          <MuteIcon width={20} height={20} color="white" />
          <Typography
            size={13}
            color="white"
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
          onPress={() => handleAction(onPin)}
        >
          <PinIcon width={20} height={20} color="white" />
          <Typography
            size={13}
            color="white"
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
          style={[styles.actionButton, { backgroundColor: "#DD524C" }]}
          onPress={() => handleAction(onDelete)}
        >
          <TrashIcon width={20} height={20} color="white" />
          <Typography
            size={13}
            color="white"
            weight="bold"
            style={styles.actionText}
          >
            Delete
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? "#3A566A" : "#9CA3AF" },
          ]}
          onPress={() => handleAction(onArchive)}
        >
          <ArchiveIcon width={20} height={20} color="white" />
          <Typography
            size={13}
            color="white"
            weight="bold"
            style={styles.actionText}
          >
            Archive
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: isDark ? "#163043" : "#DDE2E8" },
          ]}
          onPress={() => handleAction(onMore)}
        >
          <MoreIcon width={20} height={20} color={themeColors.text} />
          <Typography
            size={13}
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
      onSwipeableWillOpen={() => setIsSwiped(true)}
      onSwipeableWillClose={() => setIsSwiped(false)}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <ChatListItem
        chat={chat}
        isSelected={isSelected || isSwiped}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftActionsContainer: {
    flexDirection: "row",
    width: 152,
    gap: 4,
    paddingLeft: 12,
    marginRight: 8,
  },
  rightActionsContainer: {
    flexDirection: "row",
    width: 232,
    gap: 4,
    paddingRight: 12,
    marginLeft: 8,
  },
  actionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionText: {
    marginTop: 4,
  },
});
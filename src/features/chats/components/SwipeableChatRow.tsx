import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { SharedValue } from "react-native-reanimated";

import { ChatListItem } from "@/features/chats/components/ChatListItem";
import { SwipeActionButton } from "@/features/chats/components/SwipeActionButton";
import { Chat } from "@/features/chats/types/chat";

// SVG Icons
import ArchiveIcon from "@/assets/icons/chat/archive.svg";
import MoreIcon from "@/assets/icons/chat/more.svg";
import MuteIcon from "@/assets/icons/chat/mute.svg";
import PinIcon from "@/assets/icons/chat/pin.svg";
import TrashIcon from "@/assets/icons/chat/trash.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

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
      const { isDark, themeColors } = useAppTheme();


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
  ) => (
    <View style={styles.leftActionsContainer}>
      <SwipeActionButton
        label={chat.isMuted ? "Unmute" : "Mute"}
        icon={MuteIcon}
        backgroundColor="#E8A13A"
        isCompact={chat.isArchived}
        onPress={() => handleAction(onMute)}
      />
      <SwipeActionButton
        label={chat.isPinned ? "Unpin" : "Pin"}
        icon={PinIcon}
        backgroundColor={isDark ? "#2D4B63" : "#9CA3AF"}
        isCompact={chat.isArchived}
        onPress={() => handleAction(onPin)}
      />
    </View>
  );

  // Render Right Swipe Actions (Delete, Archive, More)
  const renderRightActions = (
    _progress: SharedValue<number>,
    _dragX: SharedValue<number>,
  ) => (
    <View style={styles.rightActionsContainer}>
      <SwipeActionButton
        label="Delete"
        icon={TrashIcon}
        backgroundColor="#DD524C"
        isCompact={chat.isArchived}
        onPress={() => handleAction(onDelete)}
      />
      <SwipeActionButton
        label={chat.isArchived ? "Unarchive" : "Archive"}
        icon={ArchiveIcon}
        backgroundColor={isDark ? "#3A566A" : "#9CA3AF"}
        isCompact={chat.isArchived}
        onPress={() => handleAction(onArchive)}
      />
      <SwipeActionButton
        label="More"
        icon={MoreIcon}
        backgroundColor={isDark ? "#163043" : "#DDE2E8"}
        textColor={themeColors.text}
        isCompact={chat.isArchived}
        onPress={() => handleAction(onMore)}
      />
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={30}
      rightThreshold={40}
      onSwipeableWillOpen={() => setIsSwiped(true)}
      onSwipeableClose={() => setIsSwiped(false)}
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
});

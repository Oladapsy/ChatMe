import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface MessagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  visible: boolean;
  position: MessagePosition | null;
  isOwnMessage: boolean;
  onClose: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageActionsSheet({
  visible,
  position,
  isOwnMessage,
  onClose,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const { themeColors } = useAppTheme();
  const { width, height } = useWindowDimensions();

  const MENU_WIDTH = 220;
  const MENU_HEIGHT = isOwnMessage ? 168 : 56;
  const SCREEN_PADDING = 16;
  const GAP = 8;

  // Keep the menu within the horizontal screen boundaries.
  const menuLeft = position
    ? Math.max(
        SCREEN_PADDING,
        Math.min(
          position.x + position.width - MENU_WIDTH,
          width - MENU_WIDTH - SCREEN_PADDING,
        ),
      )
    : SCREEN_PADDING;

  // Prefer placing the menu below the selected message.
  // If there isn't enough room, position it above.
  const menuTop = position
    ? position.y + position.height + GAP + MENU_HEIGHT <= height
      ? position.y + position.height + GAP
      : position.y - MENU_HEIGHT - GAP
    : height / 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.menu,
            {
              backgroundColor: themeColors.cardBackground,
              top: Math.max(
                SCREEN_PADDING,
                Math.min(menuTop, height - MENU_HEIGHT - SCREEN_PADDING),
              ),
              left: menuLeft,
              width: Math.min(MENU_WIDTH, width - SCREEN_PADDING * 2),
            },
          ]}
        >
          <Pressable style={styles.action} onPress={onReply}>
            <Typography size={16} color={themeColors.text}>
              Reply
            </Typography>
          </Pressable>

          {isOwnMessage && (
            <>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: themeColors.textSecondary },
                ]}
              />

              <Pressable style={styles.action} onPress={onEdit}>
                <Typography size={16} color={themeColors.text}>
                  Edit
                </Typography>
              </Pressable>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: themeColors.textSecondary },
                ]}
              />

              <Pressable style={styles.action} onPress={onDelete}>
                <Typography size={16} color="#EF4444">
                  Delete for Everyone
                </Typography>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    width: 220,
    borderRadius: 14,
    paddingVertical: 6,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  action: {
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.2,
    marginHorizontal: 12,
  },
});

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import { useMessageById } from "@/features/chats/hooks/useMessageById";

interface Props {
  conversationId: string;
  replyToMessageId: string;
  currentUserId?: string;
  isOwnBubble: boolean;
  onPress?: () => void;
}

export function ReplyQuote({
  conversationId,
  replyToMessageId,
  currentUserId,
  isOwnBubble,
  onPress,
}: Props) {
  const { themeColors } = useAppTheme();

  const {
    data: originalMessage,
    isLoading,
    isError,
  } = useMessageById(conversationId, replyToMessageId);

  const isOriginalMine =
    Boolean(currentUserId) && originalMessage?.senderId === currentUserId;

  const senderLabel = isOriginalMine ? "You" : "Reply to message";

  const previewText = isLoading
    ? "Loading message..."
    : isError || !originalMessage
      ? "Original message unavailable"
      : originalMessage.deletedAt
        ? "This message was deleted"
        : originalMessage.text ||
          (originalMessage.kind === "image"
            ? "Photo"
            : originalMessage.kind === "audio"
              ? "Voice message"
              : originalMessage.kind === "video"
                ? "Video"
                : originalMessage.kind === "document"
                  ? "Document"
                  : "Message");

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        {
          backgroundColor: isOwnBubble
            ? "rgba(255,255,255,0.15)"
            : themeColors.background,
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isOwnBubble ? "#FFFFFF" : themeColors.primary,
          },
        ]}
      />

      <View style={styles.content}>
        <Typography
          size={12}
          weight="bold"
          color={isOwnBubble ? "#FFFFFF" : themeColors.primary}
        >
          {senderLabel}
        </Typography>

        <Typography
          size={12}
          color={
            isOwnBubble ? "rgba(255,255,255,0.85)" : themeColors.textSecondary
          }
        >
          {previewText}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  indicator: {
    width: 3,
    borderRadius: 3,
    marginRight: 8,
  },
  content: {
    flex: 1,
    gap: 3,
  },
});

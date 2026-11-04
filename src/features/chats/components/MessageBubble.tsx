import React, { useRef } from "react";
import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Message } from "@/features/chats/types/message";

// Icons
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import CheckMark from "@/assets/icons/chat/check.svg";

import AudioMessagePlayer from "@/features/chats/components/AudioMessagePlayer";
import { ReplyQuote } from "@/features/chats/components/ReplyQuote";

import { formatMessageTime } from "@/features/chats/utils/formatMsgTime";
import UserPlaceholderIcon from "@/assets/icons/shared/user.svg";

interface Props {
  message: Message;
  isGroup?: boolean;
  searchQuery?: string;
  receiptStatus?: "sent" | "delivered" | "read";
  currentUserId?: string;
  onLongPress?: (position: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onJumpToMessage?: (messageId: string) => void;
  isHighlighted?: boolean;
}

export function MessageBubble({
  message,
  isGroup = false,
  searchQuery,
  receiptStatus = "sent",
  onLongPress,
  currentUserId,
  onJumpToMessage,
  isHighlighted = false,
}: Props) {
  const { themeColors } = useAppTheme();

  const isMe = message.isMe;
  const isDeleted = Boolean(message.deletedAt);
  const isEdited = Boolean(message.editedAt) && !isDeleted;

  const bubbleRef = useRef<View>(null);

  const handleLongPress = () => {
    if (!onLongPress) return;

    bubbleRef.current?.measureInWindow((x, y, width, height) => {
      onLongPress({ x, y, width, height });
    });
  };

  const sentBubbleBg = themeColors.primary;
  const receivedBubbleBg = themeColors.cardBackground;
  const receivedTextColor = themeColors.text;
  const timeColor = themeColors.textSecondary;

  // Render text with highlighted search query substrings
  const renderHighlightedText = (text: string, query?: string) => {
    if (!query || !query.trim()) {
      return (
        <Typography
          size={16}
          color={isMe ? "white" : receivedTextColor}
          style={styles.messageText}
        >
          {text}
        </Typography>
      );
    }

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = text.split(regex);

    return (
      <Typography
        size={16}
        color={isMe ? "white" : receivedTextColor}
        style={styles.messageText}
      >
        {parts.map((part, i) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          if (isMatch) {
            return (
              <Typography
                key={i}
                size={16}
                color={isMe ? "#0D2131" : "#0D2131"}
                style={[
                  styles.highlightText,
                  {
                    backgroundColor: isMe
                      ? "rgba(255, 255, 255, 0.75)"
                      : "#A7F3D0",
                  },
                ]}
              >
                {part}
              </Typography>
            );
          }
          return part;
        })}
      </Typography>
    );
  };

  // Use themeColors.blue for read status, and a semi-transparent white/grey for sent/delivered
  const receiptColor =
    receiptStatus === "read"
      ? themeColors.blue
      : isMe
        ? "rgba(255,255,255,0.7)"
        : themeColors.textSecondary;

  return (
    <View
      style={[
        styles.row,
        isMe ? styles.rowMe : styles.rowOther,
        isHighlighted && {
          backgroundColor: themeColors.primary + "25",
        },
      ]}
    >
      {/* Group Chat Avatar */}
      {!isMe && isGroup && (
        <View style={styles.avatarContainer}>
          {message.showAvatar ? (
            message.senderAvatar ? (
              <Image
                source={{ uri: message.senderAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.placeholderAvatar,
                  { backgroundColor: themeColors.primary },
                ]}
              >
                <UserPlaceholderIcon width={20} height={20} color="white" />
              </View>
            )
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}
      {/* Message Row Layout */}
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.wrapperMe : styles.wrapperOther,
        ]}
      >
        {/* Message Content Box */}
        <View ref={bubbleRef} collapsable={false}>
          <TouchableOpacity
            activeOpacity={1}
            disabled={!onLongPress}
            onLongPress={handleLongPress}
            delayLongPress={400}
            style={[
              styles.bubble,
              { backgroundColor: isMe ? sentBubbleBg : receivedBubbleBg },
              isMe ? styles.bubbleMe : styles.bubbleOther,
            ]}
          >
            {/* Group Sender Name */}
            {!isMe && isGroup && message.senderName && message.showAvatar && (
              <Typography
                size={13}
                weight="bold"
                color={themeColors.primary}
                style={styles.senderName}
              >
                {message.senderName}
              </Typography>
            )}

            {/* Quoted Reply Preview */}
            {!isDeleted && message.replyToMessageId && (
              <ReplyQuote
                conversationId={message.conversationId}
                replyToMessageId={message.replyToMessageId}
                currentUserId={currentUserId}
                isOwnBubble={Boolean(isMe)}
                onPress={() => onJumpToMessage?.(message.replyToMessageId!)}
              />
            )}

            {/* Text & Media Message / Deleted Placeholder */}
            <View style={styles.messageBody}>
              {isDeleted ? (
                <Typography
                  size={14}
                  color={isMe ? "rgba(255,255,255,0.8)" : timeColor}
                  style={styles.deletedText}
                >
                  This message was deleted
                </Typography>
              ) : (
                <>
                  {message.kind === "image" &&
                    message.attachments.map((attachment) => {
                      if (attachment.type !== "image") return null;

                      return (
                        <Image
                          key={attachment.mediaId}
                          source={{ uri: attachment.url }}
                          style={styles.messageImage}
                        />
                      );
                    })}

                  {Boolean(message.text) &&
                    renderHighlightedText(message.text!, searchQuery)}
                </>
              )}

              <View style={styles.messageMeta}>
                {isEdited && (
                  <Typography
                    size={10}
                    color={isMe ? "rgba(255,255,255,0.75)" : timeColor}
                  >
                    Edited
                  </Typography>
                )}

                <Typography
                  size={10}
                  color={isMe ? "rgba(255,255,255,0.75)" : timeColor}
                >
                  {formatMessageTime(message.createdAt)}
                </Typography>

                {isMe && !isDeleted && (
                  <View style={styles.receiptContainer}>
                    {receiptStatus === "sent" ? (
                      <CheckMark width={14} height={14} color={receiptColor} />
                    ) : (
                      <View style={styles.doubleCheckContainer}>
                        <CheckMark
                          width={14}
                          height={14}
                          color={receiptColor}
                        />
                        <CheckMark
                          width={14}
                          height={14}
                          color={receiptColor}
                          style={styles.overlapCheck}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Audio Attachment (Hidden if deleted) */}
            {!isDeleted &&
              message.kind === "audio" &&
              message.attachments.map((attachment) => {
                if (attachment.type !== "audio") return null;

                return (
                  <AudioMessagePlayer
                    key={attachment.mediaId}
                    uri={attachment.url}
                    durationMs={attachment.durationMs}
                  />
                );
              })}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  rowMe: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
  },
  placeholderAvatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "80%",
  },
  wrapperMe: {
    justifyContent: "flex-end",
  },
  wrapperOther: {
    justifyContent: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    flexShrink: 1,
  },
  bubbleMe: {
    borderBottomRightRadius: 0,
  },
  bubbleOther: {
    borderBottomLeftRadius: 0,
  },
  senderName: {
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  deletedText: {
    fontStyle: "italic",
    opacity: 0.85,
    lineHeight: 20,
  },
  highlightText: {
    borderRadius: 4,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  messageImage: {
    width: 180,
    height: 130,
    borderRadius: 10,
    marginBottom: 4,
  },
  messageBody: {
    flexShrink: 1,
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    marginTop: 2,
    gap: 4,
  },
  receiptContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  doubleCheckContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  overlapCheck: {
    marginLeft: -6,
  },
});

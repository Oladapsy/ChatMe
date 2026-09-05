import React from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { Message } from "@/features/chats/types/message";

// Icons
import DocumentIcon from "@/assets/icons/chat/document.svg";
import LocationIcon from "@/assets/icons/chat/location.svg";
import ContactIcon from "@/assets/icons/chat/contact2.svg";
import PlayIcon from "@/assets/icons/chat/play.svg";
import PauseIcon from "@/assets/icons/chat/pause.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface Props {
  message: Message;
  isGroup?: boolean;
  searchQuery?: string;
}

export function MessageBubble({
  message,
  isGroup = false,
  searchQuery,
}: Props) {
    const { isDark, themeColors } = useAppTheme();


  const isMe = message.isMe;

  const sentBubbleBg = themeColors.primary;
  const receivedBubbleBg = themeColors.cardBackground;
  const receivedTextColor = themeColors.text;
  const timeColor = themeColors.textSecondary;

  const formatAudioDuration = (sec?: number) => {
    if (!sec) return "0:00";
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowOther]}>
      {/* Group Chat Avatar */}
      {!isMe && isGroup && (
        <View style={styles.avatarContainer}>
          {message.showAvatar && message.senderAvatar ? (
            <Image
              source={{ uri: message.senderAvatar }}
              style={styles.avatar}
            />
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
        {/* Timestamp on LEFT for Sent Messages */}
        {isMe && (
          <Typography size={14} color={timeColor} style={styles.timeTextLeft}>
            {message.createdAt}
          </Typography>
        )}

        {/* Message Content Box */}
        <View
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

          {/* 1. Image Attachment */}
          {message.imageUris && message.imageUris.length > 0 && (
            <View style={styles.imageGridContainer}>
              {message.imageUris.map((uri, idx) => (
                <Image
                  key={`${uri}-${idx}`}
                  source={{ uri }}
                  style={styles.messageImage}
                />
              ))}
            </View>
          )}

          {/* 2. Audio / Voice Note Attachment */}
          {message.type === "audio" && (
            <View style={styles.audioContainer}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  {
                    backgroundColor: isMe
                      ? "rgba(255,255,255,0.25)"
                      : themeColors.primary,
                  },
                ]}
                onPress={() => console.log("Play audio:", message.audioUri)}
              >
                <PlayIcon width={16} height={16} color="white" />
              </TouchableOpacity>

              <View style={styles.audioWaveformContainer}>
                <View style={styles.waveformBar} />
                <View style={[styles.waveformBar, { height: 18 }]} />
                <View style={[styles.waveformBar, { height: 12 }]} />
                <View style={[styles.waveformBar, { height: 22 }]} />
                <View style={[styles.waveformBar, { height: 20 }]} />
                <View style={[styles.waveformBar, { height: 16 }]} />
                <View style={[styles.waveformBar, { height: 12 }]} />
                <View style={[styles.waveformBar, { height: 22 }]} />
                <View style={[styles.waveformBar, { height: 10 }]} />
                <View style={[styles.waveformBar, { height: 16 }]} />
                <View style={[styles.waveformBar, { height: 10 }]} />
                <View style={[styles.waveformBar, { height: 22 }]} />
                <View style={[styles.waveformBar, { height: 10 }]} />
                <View style={[styles.waveformBar, { height: 13 }]} />
                <View style={[styles.waveformBar, { height: 12 }]} />
              </View>

              <Typography
                size={14}
                color={isMe ? "white" : receivedTextColor}
                style={styles.audioDuration}
              >
                {formatAudioDuration(message.audioDuration)}
              </Typography>
            </View>
          )}

          {/* 3. Document Attachment */}
          {message.document && (
            <View style={styles.attachmentCard}>
              <DocumentIcon
                width={22}
                height={22}
                color={isMe ? "white" : receivedTextColor}
              />
              <View style={styles.attachmentDetails}>
                <Typography
                  size={14}
                  weight="bold"
                  color={isMe ? "white" : receivedTextColor}
                  numberOfLines={1}
                >
                  {message.document.name}
                </Typography>
                <Typography
                  size={12}
                  color={isMe ? "white" : receivedTextColor}
                  style={{ opacity: 0.8 }}
                >
                  {message.document.size}
                </Typography>
              </View>
            </View>
          )}

          {/* 4. Location Attachment */}
          {message.location && (
            <View style={[styles.attachmentCard, { paddingRight: 12 }]}>
              <LocationIcon
                width={22}
                height={22}
                color={isMe ? "white" : receivedTextColor}
              />
              <Typography
                size={14}
                weight="medium"
                color={isMe ? "white" : receivedTextColor}
                style={{ marginLeft: 8 }}
              >
                {message.location.address || "Shared Location"}
              </Typography>
            </View>
          )}

          {/* 5. Contact Attachment */}
          {message.contact && (
            <View style={styles.attachmentCard}>
              {message.contact.avatar ? (
                <Image
                  source={{ uri: message.contact.avatar }}
                  style={styles.contactAvatar}
                />
              ) : (
                <ContactIcon
                  width={40}
                  height={40}
                  color={isMe ? "white" : receivedTextColor}
                />
              )}
              <View style={styles.attachmentDetails}>
                <Typography
                  size={16}
                  weight="bold"
                  color={isMe ? "white" : receivedTextColor}
                >
                  {message.contact.name}
                </Typography>
                <Typography
                  size={14}
                  color={isMe ? "white" : receivedTextColor}
                  style={{ opacity: 0.8 }}
                >
                  {message.contact.phoneNumber}
                </Typography>
              </View>
            </View>
          )}

          {/* 6. Text Message */}
          {Boolean(message.text) &&
            renderHighlightedText(message.text!, searchQuery)}
        </View>

        {/* Timestamp on RIGHT for Received Messages */}
        {!isMe && (
          <Typography size={14} color={timeColor} style={styles.timeTextRight}>
            {message.createdAt}
          </Typography>
        )}
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
  highlightText: {
    borderRadius: 4,
    paddingHorizontal: 2,
    overflow: "hidden",
  },
  timeTextLeft: {
    marginRight: 8,
    marginBottom: 2,
  },
  timeTextRight: {
    marginLeft: 8,
    marginBottom: 2,
  },
  imageGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  messageImage: {
    width: 180,
    height: 130,
    borderRadius: 10,
  },
  audioContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 160,
    paddingVertical: 2,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  audioWaveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginHorizontal: 10,
    flex: 1,
  },
  waveformBar: {
    width: 3,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 2,
  },
  audioDuration: {
    marginLeft: "auto",
  },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  attachmentDetails: {
    marginLeft: 8,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
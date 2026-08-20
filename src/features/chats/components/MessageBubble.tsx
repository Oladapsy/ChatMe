import React from "react";
import { StyleSheet, View, Image, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import { Message } from "@/features/chats/types/message";

// Icons
import DocumentIcon from "@/assets/icons/chat/document.svg";
import LocationIcon from "@/assets/icons/chat/location.svg";
import ContactIcon from "@/assets/icons/chat/contact2.svg";

interface Props {
  message: Message;
  isGroup?: boolean;
}

export function MessageBubble({ message, isGroup = false }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  const isMe = message.isMe;

  // Colors mapped to your central theme palette
  const sentBubbleBg = themeColors.primary;
  const receivedBubbleBg = themeColors.cardBackground;
  const receivedTextColor = themeColors.text;
  const timeColor = themeColors.textSecondary;

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

      {/* Message Row Layout: [ Timestamp Left ] + [ Bubble ] + [ Timestamp Right ] */}
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.wrapperMe : styles.wrapperOther,
        ]}
      >
        {/* Timestamp on LEFT for Sent Messages */}
        {isMe && (
          <Typography size={12} color={timeColor} style={styles.timeTextLeft}>
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
              size={12}
              weight="bold"
              color={themeColors.primary}
              style={styles.senderName}
            >
              {message.senderName}
            </Typography>
          )}

          {/* 1. Image / Multi-Image Attachment */}
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

          {/* 2. Document Attachment */}
          {message.document && (
            <View style={styles.attachmentCard}>
              <DocumentIcon
                width={22}
                height={22}
                color={isMe ? "#FFFFFF" : receivedTextColor}
              />
              <View style={styles.attachmentDetails}>
                <Typography
                  size={14}
                  weight="bold"
                  color={isMe ? "#FFFFFF" : receivedTextColor}
                  numberOfLines={1}
                >
                  {message.document.name}
                </Typography>
                <Typography
                  size={12}
                  color={isMe ? "#FFFFFF" : receivedTextColor}
                  style={{ opacity: 0.8 }}
                >
                  {message.document.size}
                </Typography>
              </View>
            </View>
          )}

          {/* 3. Location Attachment */}
          {message.location && (
            <View style={styles.attachmentCard}>
              <LocationIcon
                width={22}
                height={22}
                color={isMe ? "#FFFFFF" : receivedTextColor}
              />
              <Typography
                size={14}
                weight="medium"
                color={isMe ? "#FFFFFF" : receivedTextColor}
                style={{ marginLeft: 8 }}
              >
                {message.location.address || "Shared Location"}
              </Typography>
            </View>
          )}

          {/* 4. Contact Attachment */}
          {message.contact && (
            <View style={styles.attachmentCard}>
              {message.contact.avatar ? (
                <Image
                  source={{ uri: message.contact.avatar }}
                  style={styles.contactAvatar}
                />
              ) : (
                <ContactIcon
                  width={22}
                  height={22}
                  color={isMe ? "#FFFFFF" : receivedTextColor}
                />
              )}
              <View style={styles.attachmentDetails}>
                <Typography
                  size={14}
                  weight="bold"
                  color={isMe ? "#FFFFFF" : receivedTextColor}
                >
                  {message.contact.name}
                </Typography>
                <Typography
                  size={12}
                  color={isMe ? "#FFFFFF" : receivedTextColor}
                  style={{ opacity: 0.8 }}
                >
                  {message.contact.phoneNumber}
                </Typography>
              </View>
            </View>
          )}

          {/* 5. Text Message */}
          {Boolean(message.text) && (
            <Typography
              size={15}
              color={isMe ? "#FFFFFF" : receivedTextColor}
              style={styles.messageText}
            >
              {message.text}
            </Typography>
          )}
        </View>

        {/* Timestamp on RIGHT for Received Messages */}
        {!isMe && (
          <Typography size={12} color={timeColor} style={styles.timeTextRight}>
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
    width: 32,
    height: 32,
    marginRight: 8,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
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
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
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
import React from "react";
import { StyleSheet, View, Image, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import StarFilledIcon from "@/assets/icons/shared/starMsg.svg";

export interface StarredMessage {
  id: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  dateLabel?: string;
}

interface Props {
  item: StarredMessage;
}

export function StarredMessageItem({ item }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={styles.messageGroupContainer}>
      {/* Message Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#162837" : "#F8FAFC" },
        ]}
      >
        <Typography
          size={14}
          color={themeColors.text}
          style={styles.messageText}
        >
          {item.message}
        </Typography>
        
        <View style={styles.cardFooter}>
          <StarFilledIcon width={14} height={14} color="#FFB800" />
          <Typography size={12} color={themeColors.textSecondary}>
            {item.timestamp}
          </Typography>
        </View>
      </View>

      {/* Sender Metadata Sub-row */}
      <View style={styles.senderRow}>
        <Image
          source={
            item.senderAvatar
              ? { uri: item.senderAvatar }
              : require("@/assets/images/default-avatar.png")
          }
          style={styles.avatar}
        />
        <Typography size={14} weight="bold" color={themeColors.text}>
          {item.senderName}
        </Typography>
        
        {item.dateLabel && (
          <Typography
            size={12}
            color={themeColors.textSecondary}
            style={styles.dateLabel}
          >
            {item.dateLabel}
          </Typography>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageGroupContainer: {
    gap: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  messageText: {
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dateLabel: {
    marginLeft: "auto",
  },
});
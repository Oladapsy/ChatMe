import React from "react";
import { StyleSheet, View, Image, useColorScheme } from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Colors } from "@/shared/constants/colors";
import StarFilledIcon from "@/assets/icons/shared/starMsg.svg";
import StarBgIcon from "@/assets/icons/shared/starBg.svg";
import ChevronRightIcon from "@/assets/icons/shared/chevron-right.svg";

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
      {/* 1. Main Outer Box with Background Pattern */}
      <View
        style={[
          styles.patternBox,
          { backgroundColor: isDark ? "#0F2637" : "#F5FBF7" },
        ]}
      >
        {/* Background Star Pattern SVG */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <StarBgIcon
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            color={isDark ? "#1E3A4C" : "#57B77D"}
          />
        </View>

        {/* Outer Row containing Bubble + Timestamp */}
        <View style={styles.bubbleRow}>
          {/* White Message Bubble */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#081C2C" : "#FFFFFF" },
            ]}
          >
            <Typography
              size={15}
              color={themeColors.descText}
              style={styles.messageText}
            >
              {item.message}
            </Typography>

            {/* Inline Star Icon */}
            <View style={styles.starBadge}>
              <StarFilledIcon width={14} height={14} color="#FFB23F" />
            </View>
          </View>

          {/* Timestamp on the outside right */}
          <Typography
            size={13}
            color={themeColors.mediaTab}
            style={styles.externalTimestamp}
          >
            {item.timestamp}
          </Typography>
        </View>
      </View>

      {/* 2. Sender Metadata Sub-row */}
      <View style={styles.senderRow}>
        <Image
          source={
            item.senderAvatar
              ? { uri: item.senderAvatar }
              : require("@/assets/images/default-avatar.png")
          }
          style={styles.avatar}
        />
        <Typography size={15} weight="bold" color={themeColors.text}>
          {item.senderName}
        </Typography>

        <View style={styles.senderRightSlot}>
          {item.dateLabel && (
            <Typography size={14} color={themeColors.mediaTab}>
              {item.dateLabel}
            </Typography>
          )}
          <ChevronRightIcon
            width={20}
            height={17}
            color={themeColors.mediaTab}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageGroupContainer: {
    gap: 8,
  },
  patternBox: {
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    justifyContent: "center",
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    paddingRight: 12, // Space for the star badge
    position: "relative",
  },
  messageText: {
    lineHeight: 20,
  },
  starBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  externalTimestamp: {
    marginRight: 8,
    marginLeft: 4,
  },
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  senderRightSlot: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});

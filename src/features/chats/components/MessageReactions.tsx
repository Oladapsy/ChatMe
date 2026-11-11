import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Typography } from "@/shared/components/Typography";
import { useAppTheme } from "@/shared/hooks/useAppTheme";
import type { Message } from "@/features/chats/types/message";

interface Props {
  reactions: Message["reactions"];
  currentUserId?: string;
  onRemoveReaction?: () => void;
  isRemovingReaction?: boolean;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onRemoveReaction,
  isRemovingReaction = false,
}: Props) {
  const { themeColors } = useAppTheme();

  if (!reactions?.length) return null;

  const reactionCounts = reactions.reduce<Record<string, number>>(
    (counts, reaction) => {
      counts[reaction.emoji] = (counts[reaction.emoji] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const myReaction = reactions.find(
    (reaction) => reaction.userId === currentUserId,
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.cardBackground },
      ]}
    >
      {Object.entries(reactionCounts).map(([emoji, count]) => {
        const isMyReaction = myReaction?.emoji === emoji;

        return (
          <Pressable
            key={emoji}
            disabled={!isMyReaction || !onRemoveReaction || isRemovingReaction}
            onPress={onRemoveReaction}
            style={[
              styles.reaction,
              isMyReaction && {
                backgroundColor: themeColors.primary + "20",
              },
            ]}
          >
            <Typography size={15}>{emoji}</Typography>

            {count > 1 && (
              <Typography size={12} color={themeColors.textSecondary}>
                {count}
              </Typography>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    flexWrap: "wrap",
    maxWidth: "100%",
    gap: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: -9,
  },

  reaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 12,
  },
});

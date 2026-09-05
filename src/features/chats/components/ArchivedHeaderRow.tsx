import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { Typography } from "@/shared/components/Typography";
import { Chat } from "@/features/chats/types/chat";
import ArchiveIcon from "@/assets/icons/chat/archive.svg";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

interface ArchivedHeaderRowProps {
  archivedChats: Chat[];
  onPress: () => void;
}

export function ArchivedHeaderRow({
  archivedChats,
  onPress,
}: ArchivedHeaderRowProps) {
   const { themeColors } = useAppTheme();


  if (archivedChats.length === 0) return null;

  // Format list of archived names: and cocat the names separating it
  // with a comm.
  const namesSummary = archivedChats.map((c) => c.name).join(", ");
  const latestTime = archivedChats[0]?.time ?? "";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, {backgroundColor: themeColors.primary}] }>
        <ArchiveIcon width={24} height={24} color="white" />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Typography
            variant="body"
            size={16}
            weight="bold"
            color={themeColors.text}
          >
            Archived Chat
          </Typography>
          <Typography size={14} color={themeColors.textSecondary}>
            {latestTime}
          </Typography>
        </View>

        <Typography
          size={14}
          color={themeColors.textSecondary}
          numberOfLines={1}
        >
          {namesSummary}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

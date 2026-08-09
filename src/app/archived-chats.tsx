import React from "react";
import { StyleSheet, View, FlatList, useColorScheme } from "react-native";

import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";
import { ArchivedHeader } from "@/features/chats/components/ArchivedHeader";
import { Chat } from "@/features/chats/types/chat";
import { Colors } from "@/shared/constants/colors";

interface ArchivedChatsScreenProps {
  archivedChats?: Chat[];
  onPin: (chat: Chat) => void;
  onMute: (chat: Chat) => void;
  onArchive: (chat: Chat) => void;
  onDelete: (chat: Chat) => void;
}

export default function ArchivedChatsScreen({
  archivedChats = [],
  onPin,
  onMute,
  onArchive,
  onDelete,
}: ArchivedChatsScreenProps) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Modular Header */}
      <ArchivedHeader title="Archived Chat" />

      {/* Archived Chats List */}
      <View style={styles.content}>
        <FlatList
          data={archivedChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyChatState
              title="No archived chats"
              description="Chats you archive will appear here."
            />
          }
          renderItem={({ item }) => (
            <SwipeableChatRow
              chat={item}
              onPress={() => console.log("Open archived chat:", item.name)}
              onLongPress={() => {}}
              onPin={onPin}
              onMute={onMute}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    flexGrow: 1,
    gap: 4,
  },
});
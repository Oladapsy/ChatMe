import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList, useColorScheme } from "react-native";
import { useRouter } from "expo-router";

import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";
import { ArchivedHeader } from "@/features/chats/components/ArchivedHeader";
import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { Chat } from "@/features/chats/types/chat";
import { Colors } from "@/shared/constants/colors";

export default function ArchivedChatsScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  // 1. Initialize local state with MOCK_CHATS
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);

  // 2. Filter only archived chats
  const archivedChats = useMemo(() => {
    return chats.filter((chat) => chat.isArchived);
  }, [chats]);

  // 3. Define action handlers directly inside the screen
  const handlePin = (chatToPin: Chat) => {
    setChats((prev) =>
      prev.map((item) =>
        item.id === chatToPin.id
          ? { ...item, isPinned: !item.isPinned }
          : item
      )
    );
  };

  const handleMute = (chatToMute: Chat) => {
    setChats((prev) =>
      prev.map((item) =>
        item.id === chatToMute.id
          ? { ...item, isMuted: !item.isMuted }
          : item
      )
    );
  };

  const handleArchive = (chatToArchive: Chat) => {
    // Toggling isArchived back to false removes it from this screen
    setChats((prev) =>
      prev.map((item) =>
        item.id === chatToArchive.id
          ? { ...item, isArchived: !item.isArchived }
          : item
      )
    );
  };

  const handleDelete = (chatToDelete: Chat) => {
    setChats((prev) => prev.filter((item) => item.id !== chatToDelete.id));
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ArchivedHeader title="Archived Chat" />

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
          renderItem={({ item }) => {
            const groupMembersText = Array.isArray((item as any).members)
              ? (item as any).members.join(", ")
              : ((item as any).membersText ?? "");

            return (
              <SwipeableChatRow
                chat={item}
                onPress={() => {
                  router.push({
                    pathname: "/chat-room",
                    params: {
                      id: item.id,
                      name: item.name,
                      avatar: item.avatar ?? "",
                      isGroup: (item as any).isGroup ? "true" : "false",
                      membersText: groupMembersText,
                    },
                  });
                }}
                onLongPress={() => {}}
                onPin={handlePin}
                onMute={handleMute}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            );
          }}
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
    flexGrow: 1,
    gap: 4,
  },
});
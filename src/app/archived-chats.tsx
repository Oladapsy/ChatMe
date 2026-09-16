import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useRouter } from "expo-router";

import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";
import { ArchivedHeader } from "@/features/chats/components/ArchivedHeader";
// import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { Chat } from "@/features/chats/types/chat";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// the new archive
import { useArchivedConversations } from "@/features/chats/hooks/useArchivedConversations";
import { mapConversationToChat } from "@/features/chats/utils/mapConversationToChat";

// archieve list
import { useConversationArchive } from "@/features/chats/hooks/useConversationArchive";

export default function ArchivedChatsScreen() {
  const router = useRouter();
  const { themeColors } = useAppTheme();

  const { data } = useArchivedConversations();

  const archivedChats = useMemo(() => {
    return data?.items.map(mapConversationToChat) ?? [];
  }, [data]);

  // the archive action
  const { unarchive, isPending: isArchivePending } = useConversationArchive();

  // 3. Define action handlers directly inside the screen

  const handleUnarchive = (chat: Chat) => {
    if (isArchivePending) return;

    unarchive(chat.id);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
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
                onPin={() => {}}
                onMute={() => {}}
                onArchive={handleUnarchive}
                onDelete={() => {}}
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

import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeaderSection } from "@/features/chats/components/HeaderSection";
import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { ArchivedHeaderRow } from "@/features/chats/components/ArchivedHeaderRow";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";
import PinPromptModal from "@/features/security/components/PinPromptModal";
import { Chat } from "@/features/chats/types/chat";

// for the plus fab Menu
import { FabMenuOverlay } from "@/features/chats/components/FabMenuOverlay";
import { NewGroupModal } from "@/features/chats/components/NewGroupModal";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// list of conversations from the api
import { useConversations } from "@/features/chats/hooks/useConversations";

// change the initial ui type to backend
import { mapConversationToChat } from "@/features/chats/utils/mapConversationToChat";

// the use conversation pin to pin conversations
import { useConversationPin } from "@/features/chats/hooks/useConversationPin";

// the mute hook
import { useConversationMute } from "@/features/chats/hooks/useConversationMute";

// the archieve conversation
import { useConversationArchive } from "@/features/chats/hooks/useConversationArchive";

// favourited
import { useConversationFavorite } from "@/features/chats/hooks/useConversationFavorite";

// for the archieve
import { useArchivedConversations } from "@/features/chats/hooks/useArchivedConversations";

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  // the conversation list hook
  const { data } = useConversations();
  // archieve
  const { data: archivedData } = useArchivedConversations();

  const chats = useMemo(() => {
    return data?.items.map(mapConversationToChat) ?? [];
  }, [data]);

  // for pining and unpin
  const { pin, unpin, isPending: isPinPending } = useConversationPin();
  // mute
  const { mute, unmute, isPending: isMutePending } = useConversationMute();
  // archieve
  const {
    archive,
    unarchive,
    isPending: isArchivePending,
  } = useConversationArchive();
  // favourite
  const {
    favorite,
    unfavorite,
    isPending: isFavoritePending,
  } = useConversationFavorite();

  // the top head color -> safe area side
  const topHeaderBg = isDark ? themeColors.onboardingTop : themeColors.primary;

  const [showPinModal, setShowPinModal] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // group state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // the fab icon state to handle the open and close
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Split chats into active vs. archived
  const archivedChats = useMemo(() => {
    return archivedData?.items.map(mapConversationToChat) ?? [];
  }, [archivedData]);

  const activeChats = chats;

  // Filter & sort active chats (Pinned on top)
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = query
      ? activeChats.filter((chat) => {
          const matchesName = chat.name.toLowerCase().includes(query);
          const matchesLastMessage = chat.lastMessage
            ? chat.lastMessage.toLowerCase().includes(query)
            : false;
          return matchesName || matchesLastMessage;
        })
      : activeChats;

    return [...filtered].sort((a, b) => {
      // Pinned chats always come first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      // Within the same group, newest activity comes first
      return (
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime()
      );
    });
  }, [activeChats, searchQuery]);

  // Selection toggle logic
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // handle pinning
  const handlePin = (chat: Chat) => {
    if (isPinPending) return;

    if (chat.isPinned) {
      unpin(chat.id);
    } else {
      pin(chat.id);
    }
  };

  // mute
  const handleMute = (chat: Chat) => {
    if (isMutePending) return;

    if (chat.isMuted) {
      unmute(chat.id);
    } else {
      mute({
        conversationId: chat.id,
        duration: "8_hours",
      });
    }
  };

  // archieve
  const handleArchive = (chat: Chat) => {
    if (isArchivePending) return;

    if (chat.isArchived) {
      unarchive(chat.id);
    } else {
      archive(chat.id);
    }
  };

  // favourited
  const handleFavorite = (chat: Chat) => {
    if (isFavoritePending) return;

    if (chat.isFavorited) {
      unfavorite(chat.id);
    } else {
      favorite(chat.id);
    }
  };
  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <SafeAreaView edges={["top"]} style={{ backgroundColor: topHeaderBg }}>
        <HeaderSection
          selectedCount={selectedIds.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSelection={() => setSelectedIds([])}
          onPin={() => console.log()}
          onMute={() => console.log()}
          onArchive={() => console.log()}
          onDelete={() => console.log()}
        />
      </SafeAreaView>

      <View style={styles.content}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <ArchivedHeaderRow
              archivedChats={archivedChats}
              onPress={() => router.push("/archived-chats")}
            />
          }
          ListEmptyComponent={EmptyChatState}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id);

            const groupMembersText = item.isGroup
              ? (item.members?.map((member) => member.name).join(", ") ?? "")
              : "";

            return (
              <SwipeableChatRow
                chat={item}
                isSelected={isSelected}
                onPress={() => {
                  if (selectedIds.length > 0) {
                    handleToggleSelect(item.id);
                  } else {
                    router.push({
                      pathname: "/chat-room",
                      params: {
                        id: item.id,
                        name: item.name,
                        avatar: item.avatar ?? "",
                        isGroup: item.isGroup ? "true" : "false",
                        membersText: groupMembersText,
                      },
                    });
                  }
                }}
                onLongPress={() => handleToggleSelect(item.id)}
                onPin={handlePin}
                onMute={handleMute}
                onArchive={handleArchive}
                onDelete={() => console.log("Delete is Pressed")}
                // use favourite for more for now
                onMore={handleFavorite}
              />
            );
          }}
        />
      </View>

      <FabMenuOverlay
        isOpen={isFabOpen}
        onToggle={() => setIsFabOpen((prev) => !prev)}
        onNewChat={() => router.push("/contacts")}
        onNewContact={() => router.push("/new-contact")}
        onNewGroup={() => {
          setIsFabOpen(false);
          setIsGroupModalOpen(true);
        }}
      />

      <NewGroupModal
        visible={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={(newGroup) => {
          console.log("Group Created Data:", newGroup);
        }}
      />

      <PinPromptModal
        visible={showPinModal}
        onAccept={() => {
          setShowPinModal(false);
          router.push("/(auth)/setup-pin");
        }}
        onDecline={() => setShowPinModal(false)}
      />
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
    paddingVertical: 8,
    flexGrow: 1,
    gap: 4,
  },
});

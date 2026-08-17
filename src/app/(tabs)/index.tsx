import React, { useState, useMemo } from "react";
import { StyleSheet, View, FlatList, useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { HeaderSection } from "@/features/chats/components/HeaderSection";
import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { ArchivedHeaderRow } from "@/features/chats/components/ArchivedHeaderRow";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";
import PinPromptModal from "@/features/security/components/PinPromptModal";
import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { Chat } from "@/features/chats/types/chat";
import { Colors } from "@/shared/constants/colors";

// for the plus fab Menu
import { FabMenuOverlay } from "@/features/chats/components/FabMenuOverlay";

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const themeColors = Colors[isDark ? "dark" : "light"];

  // the top head color -> safe area side
  const topHeaderBg = isDark ? themeColors.onboardingTop : themeColors.primary;

  const [showPinModal, setShowPinModal] = useState(true);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // the fab icon state to handle the open and close
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Split chats into active vs. archived
  const archivedChats = useMemo(() => {
    return chats.filter((c) => c.isArchived);
  }, [chats]);

  const activeChats = useMemo(() => {
    return chats.filter((c) => !c.isArchived);
  }, [chats]);

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
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  }, [activeChats, searchQuery]);

  // Selection toggle logic
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Actions
 const handlePin = (chatToPin?: Chat) => {
  const targetIds = chatToPin ? [chatToPin.id] : selectedIds;
  if (targetIds.length === 0) return;

  setChats((prev) => {
    let updatedChats = [...prev];

    targetIds.forEach((id) => {
      const targetIndex = updatedChats.findIndex((c) => c.id === id);
      if (targetIndex === -1) return;

      const isCurrentlyPinned = updatedChats[targetIndex].isPinned;

      if (isCurrentlyPinned) {
        // If already pinned, toggle it off (unpin)
        updatedChats[targetIndex] = {
          ...updatedChats[targetIndex],
          isPinned: false,
        };
      } else {
        // Find indices of all currently pinned chats
        const pinnedIndices = updatedChats
          .map((c, index) => (c.isPinned ? index : -1))
          .filter((index) => index !== -1);

        // If 3 chats are already pinned, unpin the top-most (first in list)
        if (pinnedIndices.length >= 3) {
          const topmostPinnedIndex = pinnedIndices[0];
          updatedChats[topmostPinnedIndex] = {
            ...updatedChats[topmostPinnedIndex],
            isPinned: false,
          };
        }

        // Pin the selected chat
        updatedChats[targetIndex] = {
          ...updatedChats[targetIndex],
          isPinned: true,
        };
      }
    });

    return updatedChats;
  });

  setSelectedIds([]);
};

  const handleMute = (chatToMute?: Chat) => {
    const targetIds = chatToMute ? [chatToMute.id] : selectedIds;
    setChats((prev) =>
      prev.map((item) =>
        targetIds.includes(item.id)
          ? { ...item, isMuted: !item.isMuted }
          : item,
      ),
    );
    setSelectedIds([]);
  };

  const handleArchive = (chatToArchive?: Chat) => {
    const targetIds = chatToArchive ? [chatToArchive.id] : selectedIds;
    setChats((prev) =>
      prev.map((item) =>
        targetIds.includes(item.id)
          ? { ...item, isArchived: !item.isArchived }
          : item,
      ),
    );
    setSelectedIds([]);
  };

  const handleDelete = (chatToDelete?: Chat) => {
    const targetIds = chatToDelete ? [chatToDelete.id] : selectedIds;
    setChats((prev) => prev.filter((item) => !targetIds.includes(item.id)));
    setSelectedIds([]);
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
          onPin={() => handlePin()}
          onMute={() => handleMute()}
          onArchive={() => handleArchive()}
          onDelete={() => handleDelete()}
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

            // Safe formatting for members text if item is a group
            const groupMembersText = Array.isArray((item as any).members)
              ? (item as any).members.join(", ")
              : (item as any).membersText ?? "";

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
                        isGroup: (item as any).isGroup ? "true" : "false",
                        membersText: groupMembersText,
                      },
                    });
                  }
                }}
                onLongPress={() => handleToggleSelect(item.id)}
                onPin={handlePin}
                onMute={handleMute}
                onArchive={handleArchive}
                onDelete={handleDelete}
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
        onNewGroup={() => console.log("New Group")}
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
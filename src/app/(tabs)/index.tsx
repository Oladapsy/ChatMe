import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
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
import PlusIcon from "@/assets/icons/shared/plus.svg";

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
    setChats((prev) =>
      prev.map((item) =>
        targetIds.includes(item.id)
          ? { ...item, isPinned: !item.isPinned }
          : item,
      ),
    );
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
            return (
              <SwipeableChatRow
                chat={item}
                isSelected={isSelected}
                onPress={() => {
                  if (selectedIds.length > 0) {
                    handleToggleSelect(item.id);
                  } else {
                    console.log("Open chat:", item.name);
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        activeOpacity={0.8}
      >
        <PlusIcon width={24} height={24} color="white" />
      </TouchableOpacity>

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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});

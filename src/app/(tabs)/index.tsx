import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "@/shared/components/Typography";
import PinPromptModal from "@/features/security/components/PinPromptModal";
import { HeaderSection } from "@/features/chats/components/HeaderSection";
import { SwipeableChatRow } from "@/features/chats/components/SwipeableChatRow";
import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { Chat } from "@/features/chats/types/chat";
import { Colors } from "@/shared/constants/colors";
import PlusIcon from "@/assets/icons/shared/plus.svg";
import { EmptyChatState } from "@/features/chats/components/EmptyChatState";

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

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) => {
      const matchesName = chat.name.toLowerCase().includes(query);

      // Check if the search query matches the last message text
      const matchesLastMessage = chat.lastMessage
        ? chat.lastMessage.toLowerCase().includes(query)
        : false;

      // Return true if EITHER the name OR the message contains the search query
      return matchesName || matchesLastMessage;
    });
  }, [chats, searchQuery]);

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
    setChats((prev) => prev.filter((item) => !targetIds.includes(item.id)));
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
      {/* Dynamic Header Section scoped to top inset */}
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

      {/* Main Content Area */}
      <View style={styles.content}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.primary }]}
        activeOpacity={0.8}
      >
        <PlusIcon width={24} height={24} color="white" />
      </TouchableOpacity>

      {/* PIN Security Modal Prompt */}
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

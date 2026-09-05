import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import MySafeAreaView from "@/shared/components/EdgeMySafeAreaView";
import { Colors } from "@/shared/constants/colors";
import { ChatRoomHeader } from "@/features/chats/components/ChatRoomHeader";
import { AttachmentModal } from "@/features/chats/components/AttachmentModal";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";
import { ChatInputBar } from "@/features/chats/components/ChatInputBar";

// Search Feature Components
import { ChatSearchHeader } from "@/features/chats/components/ChatSearchHeader";
import { ChatSearchControlBar } from "@/features/chats/components/ChatSearchControlBar";

// Icons & Background
import CloseIcon from "@/assets/icons/shared/close.svg";
import ChatBgIcon from "@/assets/icons/chat/ChatBg.svg";

// Types & Data
import { Message } from "@/features/chats/types/message";
import { MessageBubble } from "@/features/chats/components/MessageBubble";
import { MOCK_MESSAGES } from "@/features/chats/data/mockMessages";
import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

export default function ChatRoomScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();

  const { id, name, avatar, isGroup, membersText, search } =
    useLocalSearchParams<{
      id: string;
      name: string;
      avatar?: string;
      isGroup?: string;
      membersText?: string;
      search?: string;
    }>();

  const activeChatId = id || "1";

  // Search Mode States
  const [isSearching, setIsSearching] = useState(search === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Sync state if navigation parameter changes dynamically
  useEffect(() => {
    if (search === "true") {
      setIsSearching(true);
    }
  }, [search]);

  // Find matching chat details from mock data
  const currentChat = MOCK_CHATS.find((chat) => chat.id === activeChatId);

  const isGroupChat = currentChat
    ? Boolean(currentChat.isGroup)
    : isGroup === "true";
  const chatName = currentChat?.name || name;
  const chatAvatar = currentChat?.avatar || avatar;
  const groupMembers = currentChat?.members;

  const initialMessages = MOCK_MESSAGES[activeChatId] || [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [messageText, setMessageText] = useState("");
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  const { takePhoto, pickImages } = useCameraHandler();
  const flatListRef = useRef<FlatList>(null);

  const processedMessages = messages.map((msg, index) => {
    const nextMsg = messages[index + 1];
    const isLastFromSender = !nextMsg || nextMsg.senderId !== msg.senderId;
    return {
      ...msg,
      showAvatar: isLastFromSender,
    };
  });

  // Calculate indices of messages that match current search query
  const matchingIndices = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return processedMessages
      .map((msg, index) =>
        msg.text && msg.text.toLowerCase().includes(query) ? index : -1,
      )
      .filter((idx) => idx !== -1);
  }, [searchQuery, processedMessages]);

  // Scroll to targeted matching item when match index changes
  useEffect(() => {
    if (isSearching && matchingIndices.length > 0) {
      const targetIndex = matchingIndices[currentMatchIndex];
      if (targetIndex !== undefined) {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }
  }, [currentMatchIndex, matchingIndices, isSearching]);

  const handleNextMatch = () => {
    if (matchingIndices.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchingIndices.length);
  };

  const handlePrevMatch = () => {
    if (matchingIndices.length === 0) return;
    setCurrentMatchIndex((prev) =>
      prev === 0 ? matchingIndices.length - 1 : prev - 1,
    );
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    setCurrentMatchIndex(0);
  };

  const handleSendText = () => {
    if (!messageText.trim() && selectedImageUris.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChatId,
      senderId: "user_me",
      type: selectedImageUris.length > 0 ? "image" : "text",
      text: messageText.trim() || undefined,
      imageUris: selectedImageUris.length > 0 ? selectedImageUris : undefined,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageText("");
    setSelectedImageUris([]);
  };

  const handleSendAudio = (uri: string, durationSec: number) => {
    const audioMessage: Message = {
      id: Date.now().toString(),
      chatId: activeChatId,
      senderId: "user_me",
      type: "audio",
      audioUri: uri,
      audioDuration: durationSec,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isMe: true,
    };

    setMessages((prev) => [...prev, audioMessage]);
  };

  const handleCameraCapture = async () => {
    const photoUri = await takePhoto();
    if (photoUri) {
      setSelectedImageUris((prev) => [...prev, photoUri]);
    }
  };

  const handleGalleryPick = async () => {
    const imageUris = await pickImages();
    if (imageUris.length > 0) {
      setSelectedImageUris((prev) => [...prev, ...imageUris]);
    }
  };

  const handleSelectRecentPhoto = (uri: string) => {
    setSelectedImageUris((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri],
    );
  };

  const removeSelectedImage = (uriToRemove: string) => {
    setSelectedImageUris((prev) => prev.filter((uri) => uri !== uriToRemove));
  };

  const handleHeaderPress = () => {
    if (isGroupChat) {
      router.push({
        pathname: "/group-details",
        params: { id: activeChatId },
      });
    } else {
      router.push({
        pathname: "/user-details",
        params: { id: activeChatId },
      });
    }
  };

  return (
    <MySafeAreaView
      color={isDark ? themeColors.cardBackground : themeColors.primary}
    >
      {/* Header View Switching */}
      {isSearching ? (
        <ChatSearchHeader
          searchQuery={searchQuery}
          onSearchChange={(text) => {
            setSearchQuery(text);
            setCurrentMatchIndex(0);
          }}
          onCancel={handleCloseSearch}
          backgroundColor={
            isDark ? themeColors.cardBackground : themeColors.primary
          }
        />
      ) : (
        <ChatRoomHeader
          name={chatName}
          avatar={chatAvatar}
          isGroup={isGroupChat}
          members={groupMembers}
          membersText={membersText}
          backgroundColor={
            isDark ? themeColors.cardBackground : themeColors.primary
          }
          onHeaderPress={handleHeaderPress}
          onVideoCall={() => console.log("Video call clicked")}
          onVoiceCall={() => console.log("Voice call clicked")}
        />
      )}

      <KeyboardAvoidingView
        style={[
          styles.keyboardView,
          { backgroundColor: isDark ? "#0A1926" : "#F4F6F8" },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatBody}>
          {/* Background Vector Pattern */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <ChatBgIcon
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              color={
                isDark
                  ? "rgba(255, 255, 255, 0.04)"
                  : "rgba(16, 185, 129, 0.06)"
              }
            />
          </View>

          {/* Chat Feed */}
          <FlatList
            ref={flatListRef}
            data={processedMessages}
            keyExtractor={(item) => item.id}
            onScrollToIndexFailed={(info) => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isGroup={isGroupChat}
                searchQuery={isSearching ? searchQuery : undefined}
              />
            )}
            contentContainerStyle={{
              paddingVertical: 10,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
            onContentSizeChange={() => {
              if (!isSearching) {
                flatListRef.current?.scrollToEnd({ animated: true });
              }
            }}
          />
        </View>

        {/* Selected Images Strip */}
        {selectedImageUris.length > 0 && !isSearching && (
          <View style={styles.previewWrapper}>
            <FlatList
              data={selectedImageUris}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(uri, idx) => `${uri}-${idx}`}
              contentContainerStyle={styles.previewStrip}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.previewContainer,
                    { backgroundColor: isDark ? "#163043" : "white" },
                  ]}
                >
                  <Image source={{ uri: item }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removePreviewBtn}
                    onPress={() => removeSelectedImage(item)}
                  >
                    <CloseIcon width={12} height={12} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Bottom Bar View Switching */}
        {isSearching ? (
          <ChatSearchControlBar
            currentIndex={currentMatchIndex}
            totalCount={matchingIndices.length}
            onNext={handleNextMatch}
            onPrev={handlePrevMatch}
            isDark={isDark}
          />
        ) : (
          <ChatInputBar
            text={messageText}
            onChangeText={setMessageText}
            onSendText={handleSendText}
            onSendAudio={handleSendAudio}
            onOpenAttachment={() => setAttachmentVisible(true)}
            hasAttachments={selectedImageUris.length > 0}
          />
        )}
      </KeyboardAvoidingView>

      <AttachmentModal
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        onOpenCamera={handleCameraCapture}
        onOpenGallery={handleGalleryPick}
        onSelectImage={handleSelectRecentPhoto}
        onSelectDocument={() => console.log("Document selected")}
        onSelectLocation={() => console.log("Location selected")}
        onSelectContact={() => console.log("Contact selected")}
      />
    </MySafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  chatBody: {
    flex: 1,
    position: "relative",
  },
  previewWrapper: {
    maxHeight: 80,
    marginBottom: 6,
  },
  previewStrip: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  previewContainer: {
    padding: 4,
    borderRadius: 10,
    position: "relative",
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  removePreviewBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 4,
  },
});

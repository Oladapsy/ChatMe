import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Crypto from "expo-crypto";
import axios from "axios";

import MySafeAreaView from "@/shared/components/EdgeMySafeAreaView";
import { ChatRoomHeader } from "@/features/chats/components/ChatRoomHeader";
import { AttachmentModal } from "@/features/chats/components/AttachmentModal";
import { useCameraHandler } from "@/features/chats/hooks/useCameraHandler";
import { ChatInputBar } from "@/features/chats/components/ChatInputBar";
import { Typography } from "@/shared/components/Typography";

// Search Feature Components
import { ChatSearchHeader } from "@/features/chats/components/ChatSearchHeader";
import { ChatSearchControlBar } from "@/features/chats/components/ChatSearchControlBar";

// Icons & Background
import CloseIcon from "@/assets/icons/shared/close.svg";
import ChatBgIcon from "@/assets/icons/chat/ChatBg.svg";

// Types & Data
import { MessageBubble } from "@/features/chats/components/MessageBubble";
import { MOCK_CHATS } from "@/features/chats/data/mockChats";
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// get msgs for a conversation
import { useMessages } from "@/features/chats/hooks/useMessages";
// send msgs
import { useSendMessage } from "@/features/chats/hooks/useSendMessage";
// get current user
import { useMe } from "@/features/auth/hooks/useMe";

// block hooks
import { useBlockedUsers } from "@/features/contacts/hooks/useBlockedUsers";
import { useUnblockUser } from "@/features/contacts/hooks/useUnblockUser";

// format the chat date
import {
  processMessages,
  type ProcessedMessage,
} from "@/features/chats/utils/processMessages";
import { MessageDateSeparator } from "@/features/chats/components/MessageDateSeparator";

import { findMatchingMessageIndices } from "@/features/chats/utils/searchMessages";

// abstract the image upload
import { uploadChatImage } from "@/features/chats/utils/uploadChatMedia";
import { uploadChatAudio } from "@/features/chats/utils/uploadChatMedia";

//socket
import { useChatSocket } from "@/features/chats/hooks/useChatSocket";
import { useConversations } from "@/features/chats/hooks/useConversations";
import { useSearchMessages } from "@/features/chats/hooks/useSearchMessages";

export default function ChatRoomScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();
  const [isSending, setIsSending] = useState(false);

  const { id, name, avatar, isGroup, membersText, search } =
    useLocalSearchParams<{
      id: string;
      name: string;
      avatar?: string;
      isGroup?: string;
      membersText?: string;
      search?: string;
    }>();

  const { data: currentUser } = useMe();

  const activeChatId = id || "1";
  useChatSocket(activeChatId);

  const { send: sendMessage, isPending: isSendingMessage } =
    useSendMessage(activeChatId);

  const { data: messagesData } = useMessages(activeChatId);

  // Updated block & conversation hooks
  const {
    data: blockedData,
    isLoading: isLoadingBlocks,
    isError: isBlocksError,
  } = useBlockedUsers();

  const unblockMutation = useUnblockUser();

  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    isError: isConversationsError,
  } = useConversations();

  const currentConversation = conversationsData?.items.find(
    (conversation) => conversation.id === activeChatId,
  );

  const otherParticipant =
    currentConversation?.type === "direct"
      ? currentConversation.otherParticipant
      : undefined;

  const isDirectConversation = currentConversation?.type === "direct";

  const isContactBlocked =
    isDirectConversation &&
    !!otherParticipant?.id &&
    (blockedData?.items.some((item) => item.user.id === otherParticipant.id) ??
      false);

  const isBlockStatusLoading = isLoadingBlocks || isLoadingConversations;

  const isBlockStatusUnavailable = isBlocksError || isConversationsError;

  // Search Mode States
  const [isSearching, setIsSearching] = useState(search === "true");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // debounce search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const {
    data: serverSearchData,
    isFetching: isServerSearching,
    isError: isServerSearchError,
  } = useSearchMessages(activeChatId, isSearching ? debouncedSearchQuery : "");

  // Sync state if navigation parameter changes dynamically
  useEffect(() => {
    if (search === "true") {
      setIsSearching(true);
    }
  }, [search]);

  // Close attachment modal if contact becomes blocked or status changes
  useEffect(() => {
    if (isContactBlocked || isBlockStatusLoading || isBlockStatusUnavailable) {
      setAttachmentVisible(false);
    }
  }, [isContactBlocked, isBlockStatusLoading, isBlockStatusUnavailable]);

  // Find matching chat details from mock data
  const currentChat = MOCK_CHATS.find((chat) => chat.id === activeChatId);

  const isGroupChat = currentChat
    ? Boolean(currentChat.isGroup)
    : isGroup === "true";
  const chatName =
    currentChat?.name ||
    (currentConversation?.type === "direct"
      ? currentConversation.otherParticipant.displayName
      : currentConversation?.type === "group"
        ? currentConversation.name
        : undefined) ||
    name ||
    "Unknown contact";

  const chatAvatar =
    currentChat?.avatar ||
    (currentConversation?.type === "direct"
      ? currentConversation.otherParticipant.avatarUrl
      : currentConversation?.type === "group"
        ? currentConversation.avatarUrl
        : undefined) ||
    avatar;
  const groupMembers = currentChat?.members;

  const messages = useMemo(() => {
    const historyMessages = messagesData?.items ?? [];
    const searchMessages =
      isSearching && debouncedSearchQuery
        ? (serverSearchData?.items ?? [])
        : [];

    // Merge history and search results without duplicate messages.
    const uniqueMessages = new Map(
      [...historyMessages, ...searchMessages].map((message) => [
        message.id,
        message,
      ]),
    );

    // Keep messages in chronological order for the chat timeline.
    return Array.from(uniqueMessages.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [
    messagesData?.items,
    serverSearchData?.items,
    isSearching,
    debouncedSearchQuery,
  ]);

  const [messageText, setMessageText] = useState("");
  const [selectedImageUris, setSelectedImageUris] = useState<string[]>([]);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  const { takePhoto, pickImages } = useCameraHandler();
  const flatListRef = useRef<FlatList>(null);
  const sendInFlightRef = useRef(false);

  const processedMessages = useMemo(() => {
    return processMessages(messages, currentUser?.id);
  }, [messages, currentUser?.id]);

  // Calculate indices of messages that match current search query
  const matchingIndices = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      return [];
    }

    // Use backend results once they correspond to the current query.
    if (isSearching && debouncedSearchQuery === query && serverSearchData) {
      const matchingMessageIds = new Set(
        serverSearchData.items.map((message) => message.id),
      );

      return processedMessages.reduce<number[]>((matches, item, index) => {
        if (item.type === "message" && matchingMessageIds.has(item.id)) {
          matches.push(index);
        }

        return matches;
      }, []);
    }

    // Keep local matching available while the backend request is pending.
    return findMatchingMessageIndices(processedMessages, query);
  }, [
    processedMessages,
    searchQuery,
    isSearching,
    debouncedSearchQuery,
    serverSearchData,
  ]);

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

  // Unblock handler directly from the notice bar
  const handleUnblockFromBanner = () => {
    if (!otherParticipant?.id || unblockMutation.isPending) return;

    unblockMutation.mutate(otherParticipant.id, {
      onSuccess: () =>
        Alert.alert(
          "Success",
          `${otherParticipant.displayName} has been unblocked.`,
        ),
      onError: () => Alert.alert("Error", "Unable to unblock this contact."),
    });
  };

  // Send text handler with comprehensive status checks and error logging
  const handleSend = async () => {
    if (
      sendInFlightRef.current ||
      isContactBlocked ||
      isBlockStatusLoading ||
      isBlockStatusUnavailable
    ) {
      return;
    }

    const draftTextAtSubmit = messageText;
    const text = draftTextAtSubmit.trim();

    if (!text && selectedImageUris.length === 0) {
      return;
    }

    sendInFlightRef.current = true;
    setIsSending(true);

    try {
      const attachmentMediaIds: string[] = [];

      for (const uri of selectedImageUris) {
        const mediaId = await uploadChatImage(uri);
        attachmentMediaIds.push(mediaId);
      }

      await sendMessage({
        clientMessageId: Crypto.randomUUID(),
        ...(text ? { text } : {}),
        ...(attachmentMediaIds.length > 0 ? { attachmentMediaIds } : {}),
      });

      setMessageText((currentText) =>
        currentText === draftTextAtSubmit ? "" : currentText,
      );
      setSelectedImageUris((currentUris) =>
        currentUris.filter((uri) => !selectedImageUris.includes(uri)),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("SEND MESSAGE ERROR:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });

        const status = error.response?.status;

        if (status === 404) {
          Alert.alert(
            "Message not sent",
            isContactBlocked
              ? "You blocked this contact. Unblock them to send messages."
              : "This conversation or messaging resource could not be found.",
          );
          return;
        }
      } else {
        console.error("SEND MESSAGE ERROR:", error);
      }

      Alert.alert(
        "Message not sent",
        "Something went wrong. Please try again.",
      );
    } finally {
      sendInFlightRef.current = false;
      setIsSending(false);
    }
  };

  // Audio send handler protected by block/loading guards and detailed error catching
  const handleSendAudio = async (uri: string, durationSec: number) => {
    if (isContactBlocked || isBlockStatusLoading || isBlockStatusUnavailable) {
      return;
    }

    try {
      const mediaId = await uploadChatAudio(uri, durationSec);

      const sentMessage = await sendMessage({
        clientMessageId: Crypto.randomUUID(),
        attachmentMediaIds: [mediaId],
      });

      console.log("AUDIO MESSAGE SENT:", sentMessage);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("AUDIO MESSAGE ERROR:", {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method,
        });
      } else {
        console.error("AUDIO MESSAGE ERROR:", error);
      }

      Alert.alert(
        "Audio not sent",
        "Unable to send your voice message. Please try again.",
      );
    }
  };

  const handleCameraCapture = async () => {
    if (isContactBlocked || isBlockStatusLoading) return;
    const photoUri = await takePhoto();
    if (photoUri) {
      setSelectedImageUris((prev) => [...prev, photoUri]);
    }
  };

  const handleGalleryPick = async () => {
    if (isContactBlocked || isBlockStatusLoading) return;
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
      return;
    }

    if (!otherParticipant?.id) {
      console.warn("Unable to find the other participant's user ID.");
      return;
    }

    router.push({
      pathname: "/user-details",
      params: {
        id: otherParticipant.id,
        conversationId: activeChatId,
        name: otherParticipant.displayName || chatName || "",
        avatar: otherParticipant.avatarUrl || chatAvatar || "",
      },
    });
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
            renderItem={({ item }) => {
              if (item.type === "date") {
                return <MessageDateSeparator label={item.label} />;
              }

              return (
                <MessageBubble
                  message={item}
                  isGroup={isGroupChat}
                  searchQuery={isSearching ? searchQuery : undefined}
                />
              );
            }}
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
        {selectedImageUris.length > 0 && !isSearching && !isContactBlocked && (
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

        {/* Bottom Bar / Blocked Status Switching */}
        {isSearching ? (
          <ChatSearchControlBar
            currentIndex={currentMatchIndex}
            totalCount={matchingIndices.length}
            onNext={handleNextMatch}
            onPrev={handlePrevMatch}
            isDark={isDark}
          />
        ) : isBlockStatusLoading ? (
          <View style={styles.blockedNoticeContainer}>
            <Typography size={14} color={themeColors.textSecondary}>
              Checking conversation status...
            </Typography>
          </View>
        ) : isBlockStatusUnavailable ? (
          <View style={styles.blockedNoticeContainer}>
            <Typography size={14} color={themeColors.textSecondary}>
              Unable to verify contact status. Please try again.
            </Typography>
          </View>
        ) : isContactBlocked ? (
          <View
            style={[
              styles.blockedNoticeContainer,
              {
                backgroundColor: isDark
                  ? themeColors.cardBackground
                  : "#FFFFFF",
                borderTopColor: isDark ? "#163043" : "#EAEEF2",
              },
            ]}
          >
            <Typography
              size={14}
              color={themeColors.textSecondary}
              style={styles.blockedText}
            >
              You blocked this contact. Unblock them to send messages.
            </Typography>

            <TouchableOpacity
              onPress={handleUnblockFromBanner}
              disabled={unblockMutation.isPending}
              activeOpacity={0.7}
            >
              <Typography size={14} weight="bold" color={themeColors.primary}>
                {unblockMutation.isPending ? "Unblocking..." : "Unblock"}
              </Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <ChatInputBar
            text={messageText}
            onChangeText={setMessageText}
            onSendText={handleSend}
            onSendAudio={handleSendAudio}
            onOpenAttachment={() => setAttachmentVisible(true)}
            hasAttachments={selectedImageUris.length > 0}
            isSending={isSending || isSendingMessage}
          />
        )}
      </KeyboardAvoidingView>

      <AttachmentModal
        visible={
          attachmentVisible &&
          !isContactBlocked &&
          !isBlockStatusLoading &&
          !isBlockStatusUnavailable
        }
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
  blockedNoticeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  blockedText: {
    flex: 1,
    marginRight: 12,
  },
});

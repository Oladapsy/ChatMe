import { mergePendingMessages } from "@/features/chats/utils/mergePendingMessages";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useAppTheme } from "@/shared/hooks/useAppTheme";

// get msgs for a conversation
import { useMessages } from "@/features/chats/hooks/useMessages";
// send msgs
import { useMessageDelivery } from "@/features/chats/hooks/useMessageDelivery";
// get current user
import { useMe } from "@/features/auth/hooks/useMe";

// block hooks
import { useBlockedUsers } from "@/features/contacts/hooks/useBlockedUsers";
import { useUnblockUser } from "@/features/contacts/hooks/useUnblockUser";

// format the chat date
import { processMessages } from "@/features/chats/utils/processMessages";
import { MessageDateSeparator } from "@/features/chats/components/MessageDateSeparator";

// abstract the image upload

//socket
import { useChatSocket } from "@/features/chats/hooks/useChatSocket";
import { useConversations } from "@/features/chats/hooks/useConversations";
import { useSearchMessages } from "@/features/chats/hooks/useSearchMessages";
import { useUpdateReceipts } from "@/features/chats/hooks/useUpdateReceipts";
import { useReceiptFrontiers } from "@/features/chats/hooks/useReceiptFrontiers";
import { useComposerDraft } from "@/features/chats/hooks/useComposerDraft";
import { RecoveryState } from "@/shared/components/RecoveryState";
import { useMarkConversationAsRead } from "@/features/chats/hooks/useMarkConversationAsRead";
// edit msg and delete
import { useMessageActions } from "@/features/chats/hooks/useMessageActions";
import type { Message } from "@/features/chats/types/message";
import { MessageActionsSheet } from "@/features/chats/components/MessageActionsSheet";
import { useQueryClient } from "@tanstack/react-query";
// emoji
import { useSetMessageReaction } from "@/features/chats/hooks/useSetMessageReaction";
import { useRemoveMessageReaction } from "@/features/chats/hooks/useRemoveMessageReaction";

type MessagePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function ChatRoomScreen() {
  const router = useRouter();
  const { isDark, themeColors } = useAppTheme();
  const [isAtLatest, setIsAtLatest] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
    null,
  );
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [pendingJumpMessageId, setPendingJumpMessageId] = useState<
    string | null
  >(null);

  const queryClient = useQueryClient();
  const [messagePosition, setMessagePosition] =
    useState<MessagePosition | null>(null);

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

  const activeChatId = id || "";
  const { editMessage, deleteMessage, isEditingMessage, isDeletingMessage } =
    useMessageActions(activeChatId);
  const { setReaction, isSettingReaction } =
    useSetMessageReaction(activeChatId);
  const { removeReaction, isRemovingReaction } =
    useRemoveMessageReaction(activeChatId);
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  const [isAppActive, setIsAppActive] = useState(
    AppState.currentState === "active",
  );

  const realtime = useChatSocket(activeChatId, currentUser?.id);

  const { markDelivered, markRead } = useUpdateReceipts(activeChatId);
  const { data: receiptFrontiersData } = useReceiptFrontiers(activeChatId);
  const { mutateAsync: markConversationAsRead } =
    useMarkConversationAsRead(activeChatId);

  const { submit, retry, pendingMessages, confirmMessages, isSending } = useMessageDelivery(activeChatId);

  // Pagination properties from useMessages
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeChatId);

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

  useEffect(() => {
    if (!highlightedMessageId) return;

    const timeout = setTimeout(() => {
      setHighlightedMessageId(null);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [highlightedMessageId]);

  const {
    data: serverSearchData,
    isFetching: isServerSearching,
    isError: isServerSearchError,
    refetch: refetchSearchMessages,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
    isFetchingNextPage: isFetchingNextSearchPage,
  } = useSearchMessages(activeChatId, isSearching ? debouncedSearchQuery : "");

  const handleRemoveReaction = async (messageId: string) => {
    if (isRemovingReaction) return;

    try {
      if (!currentUser?.id) return;

      await removeReaction({
        messageId,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error("REMOVE REACTION ERROR:", error);

      Alert.alert(
        "Unable to remove reaction",
        "Something went wrong. Please try again.",
      );
    }
  };
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

  const isGroupChat =
    currentConversation?.type === "group" || isGroup === "true";

  const chatName =
    (currentConversation?.type === "direct"
      ? currentConversation.otherParticipant.displayName
      : currentConversation?.type === "group"
        ? currentConversation.name
        : undefined) ||
    name ||
    "Unknown contact";

  const chatAvatar =
    (currentConversation?.type === "direct"
      ? currentConversation.otherParticipant.avatarUrl
      : currentConversation?.type === "group"
        ? currentConversation.avatarUrl
        : undefined) || avatar;

  const groupMembers = undefined;

  const messages = useMemo(() => {
    const historyMessages =
      messagesData?.pages.flatMap((page) => page.items) ?? [];

    const query = searchQuery.trim();
    const searchPagesMatchCurrentQuery =
      isSearching && query.length > 0 && query === debouncedSearchQuery;

    const searchMessages = searchPagesMatchCurrentQuery
      ? (serverSearchData?.pages.flatMap((page) => page.items) ?? [])
      : [];

    const uniqueMessages = new Map(
      [...historyMessages, ...searchMessages].map((message) => [
        message.id,
        message,
      ]),
    );

    return mergePendingMessages(Array.from(uniqueMessages.values()), pendingMessages).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [
    messagesData?.pages,
    pendingMessages,
    serverSearchData?.pages,
    isSearching,
    searchQuery,
    debouncedSearchQuery,
  ]);

  useEffect(() => {
    confirmMessages(messagesData?.pages.flatMap(page => page.items) ?? []);
  }, [messagesData, pendingMessages]);

  // Calculate receipt status for messages sent by the current user.

  const receiptStatusByMessageId = useMemo(() => {
    const statuses = new Map<string, "sent" | "delivered" | "read">();

    if (!currentUser?.id || !receiptFrontiersData?.items) {
      return statuses;
    }

    // Get receipt progress for everyone except the current user.
    const recipientFrontiers = receiptFrontiersData.items
      .filter((frontier) => frontier.userId !== currentUser.id)
      .map((frontier) => ({
        deliveredIndex: frontier.delivered
          ? messages.findIndex(
              (message) => message.id === frontier.delivered?.messageId,
            )
          : -1,

        readIndex: frontier.read
          ? messages.findIndex(
              (message) => message.id === frontier.read?.messageId,
            )
          : -1,
      }));

    // Only calculate receipts when we have at least one recipient.
    if (recipientFrontiers.length === 0) {
      return statuses;
    }

    messages.forEach((message, index) => {
      // Receipt indicators are only displayed on our own messages.
      if (message.senderId !== currentUser.id) return;

      // Every recipient must have reached this message's frontier.
      const deliveredToEveryone = recipientFrontiers.every(
        (frontier) =>
          frontier.deliveredIndex !== -1 && index <= frontier.deliveredIndex,
      );

      const readByEveryone = recipientFrontiers.every(
        (frontier) => frontier.readIndex !== -1 && index <= frontier.readIndex,
      );

      if (readByEveryone) {
        statuses.set(message.id, "read");
      } else if (deliveredToEveryone) {
        statuses.set(message.id, "delivered");
      } else {
        statuses.set(message.id, "sent");
      }
    });

    return statuses;
  }, [messages, receiptFrontiersData, currentUser?.id]);

  // Find the newest message sent by another participant.
  const latestIncomingMessage = useMemo(() => {
    if (!currentUser?.id) return undefined;

    const incomingMessages = (
      messagesData?.pages.flatMap((page) => page.items) ?? []
    ).filter((message) => message.senderId !== currentUser.id);

    if (incomingMessages.length === 0) return undefined;

    return incomingMessages.reduce((latest, message) =>
      new Date(message.createdAt).getTime() >
      new Date(latest.createdAt).getTime()
        ? message
        : latest,
    );
  }, [messagesData?.pages, currentUser?.id]);

  // Remember the last successfully processed message IDs.
  const lastDeliveredMessageIdRef = useRef<string | null>(null);
  const lastReadMessageIdRef = useRef<string | null>(null);

  // Prevent overlapping receipt requests.
  const deliveredInFlightRef = useRef(false);
  const readInFlightRef = useRef(false);

  // Keep the latest message and current conditions available to processors.
  const latestIncomingMessageIdRef = useRef<string | null>(null);
  const canMarkDeliveredRef = useRef(false);
  const canMarkReadRef = useRef(false);
  const activeChatIdRef = useRef(activeChatId);

  latestIncomingMessageIdRef.current = latestIncomingMessage?.id ?? null;
  canMarkDeliveredRef.current = isScreenFocused && isAppActive && !isSearching;
  canMarkReadRef.current =
    isScreenFocused && isAppActive && !isSearching && isAtLatest;
  activeChatIdRef.current = activeChatId;

  const { text: messageText, images: selectedImageUris, setText: setMessageText, setImages: setSelectedImageUris, ready: draftReady } = useComposerDraft(currentUser?.id, activeChatId);
  const [attachmentVisible, setAttachmentVisible] = useState(false);

  const { takePhoto, pickImages } = useCameraHandler();
  const flatListRef = useRef<FlatList>(null);
  const isLoadingOlderRef = useRef(false);
  const followingLatestRef = useRef(true);
  const [followingLatest, setFollowingLatest] = useState(true);
  const userScrollingRef = useRef(false);
  const bottomFrame = useRef<number | null>(null);
  const searchingRef = useRef(isSearching);
  searchingRef.current = isSearching;
  const followLatest = useCallback((follow: boolean) => {
    followingLatestRef.current = follow;
    setFollowingLatest(follow);
  }, []);
  const scrollToLatest = useCallback(() => {
    if (bottomFrame.current !== null) cancelAnimationFrame(bottomFrame.current);
    const scroll = () => {
      if (!followingLatestRef.current || searchingRef.current || userScrollingRef.current) return;
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    };
    bottomFrame.current = requestAnimationFrame(() => {
      scroll();
      // Re-check after native layout/composer resizing reaches the next frame.
      bottomFrame.current = requestAnimationFrame(() => { bottomFrame.current = null; scroll(); });
    });
  }, []);
  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", scrollToLatest);
    const hidden = Keyboard.addListener("keyboardDidHide", scrollToLatest);
    return () => {
      shown.remove(); hidden.remove();
      if (bottomFrame.current !== null) cancelAnimationFrame(bottomFrame.current);
    };
  }, [scrollToLatest]);
  useEffect(() => {
    userScrollingRef.current = false;
    followLatest(true);
    setIsAtLatest(true);
    scrollToLatest();
  }, [activeChatId, followLatest, scrollToLatest]);
  const sendInFlightRef = useRef(false);
  const isJumpingToMessageRef = useRef(false);

  const processedMessages = useMemo(() => {
    return processMessages(messages, currentUser?.id).reverse();
  }, [messages, currentUser?.id]);

  useEffect(() => {
    if (!pendingJumpMessageId) return;
    followLatest(false);

    const targetIndex = processedMessages.findIndex(
      (item) => item.type === "message" && item.id === pendingJumpMessageId,
    );

    if (targetIndex === -1) return;

    const frame = requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      });

      setHighlightedMessageId(pendingJumpMessageId);
      setPendingJumpMessageId(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [pendingJumpMessageId, processedMessages, followLatest]);

  const latestScrollMessage = messages[messages.length - 1];
  const latestScrollIdentity = latestScrollMessage?.clientMessageId || latestScrollMessage?.id;
  const previousScrollIdentity = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (isSearching || !latestScrollIdentity) return;
    const newMessage = previousScrollIdentity.current !== latestScrollIdentity;
    previousScrollIdentity.current = latestScrollIdentity;
    if (newMessage && latestScrollMessage?.senderId === currentUser?.id) followLatest(true);
    if (followingLatestRef.current) scrollToLatest();
  }, [latestScrollIdentity, isSearching, latestScrollMessage?.senderId, currentUser?.id, followLatest, scrollToLatest]);

  // Calculate indices of messages that match current search query
  const matchingIndices = useMemo(() => {
    const query = searchQuery.trim();

    if (!query || query !== debouncedSearchQuery || !serverSearchData) {
      return [];
    }

    const matchingMessageIds = new Set(
      serverSearchData.pages.flatMap((page) =>
        page.items.map((message) => message.id),
      ),
    );

    return processedMessages.reduce<number[]>((matches, item, index) => {
      if (item.type === "message" && matchingMessageIds.has(item.id)) {
        matches.push(index);
      }

      return matches;
    }, []);
  }, [processedMessages, searchQuery, debouncedSearchQuery, serverSearchData]);

  //These conditions distinguish a search that is still running from a completed search with no matches or a failed request.
  const normalizedSearchQuery = searchQuery.trim();

  const isSearchDebouncing = normalizedSearchQuery !== debouncedSearchQuery;

  const isSearchLoading =
    isSearching &&
    normalizedSearchQuery.length > 0 &&
    (isSearchDebouncing || isServerSearching);

  const showSearchError =
    isSearching &&
    normalizedSearchQuery.length > 0 &&
    !isSearchDebouncing &&
    isServerSearchError;

  const showNoSearchResults =
    isSearching &&
    normalizedSearchQuery.length > 0 &&
    !isSearchDebouncing &&
    !isServerSearching &&
    !isServerSearchError &&
    matchingIndices.length === 0;

  // handle long press a msg
  const handleMessageLongPress = (
    message: Message,
    position: MessagePosition,
  ) => {
    if (message.deletedAt) return;

    setSelectedMessage(message);
    setMessagePosition(position);
    setShowMessageActions(true);
  };

  const handleCloseMessageActions = () => {
    setShowMessageActions(false);
    setSelectedMessage(null);
    setMessagePosition(null);
  };
  const handleEditMessage = () => {
    if (!selectedMessage || selectedMessage.deletedAt) return;

    const messageToEdit = selectedMessage;

    handleCloseMessageActions();

    setEditingMessage(messageToEdit);
    setMessageText(messageToEdit.text ?? "");
  };

  const handleReplyToMessage = () => {
    if (!selectedMessage) return;

    const messageToReply = selectedMessage;

    handleCloseMessageActions();

    // Exit editing mode if necessary
    setEditingMessage(null);

    // Store the message we're replying to
    setReplyingToMessage(messageToReply);
  };

  const handleReactToMessage = async (emoji: string) => {
    if (!selectedMessage || isSettingReaction) return;

    const messageId = selectedMessage.id;

    handleCloseMessageActions();

    try {
      if (!currentUser?.id) return;

      await setReaction({
        messageId,
        emoji,
        userId: currentUser.id,
      });
    } catch (error) {
      console.error("REACTION ERROR:", error);

      Alert.alert(
        "Reaction failed",
        "Unable to react to this message. Please try again.",
      );
    }
  };

  const handleCancelReply = () => {
    setReplyingToMessage(null);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage || isDeletingMessage) return;

    const messageToDelete = selectedMessage;

    handleCloseMessageActions();

    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message for everyone?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete for Everyone",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMessage(messageToDelete.id);

              console.log("Message deleted successfully:", messageToDelete.id);
            } catch (error) {
              console.error("Failed to delete message:", error);

              Alert.alert(
                "Delete Failed",
                "Unable to delete this message. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

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

  // Scroll handler for older messages pagination (reaching the top)
  const handleMessageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    // Check whether the user is near the latest message.
    const distanceFromBottom = Math.max(0, contentOffset.y);
    const distanceFromOldest = contentSize.height - layoutMeasurement.height - contentOffset.y;

    setIsAtLatest(distanceFromBottom <= 24);
    // Layout-driven scroll events must not turn off bottom following.
    if (userScrollingRef.current) followLatest(distanceFromBottom <= 24);

    // Load older messages when the user reaches the top.
    if (
      userScrollingRef.current &&
      distanceFromOldest <= 50 &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoadingOlderRef.current &&
      !isJumpingToMessageRef.current
    ) {
      isLoadingOlderRef.current = true;

      fetchNextPage().finally(() => {
        isLoadingOlderRef.current = false;
      });
    }
  };

  const handleNextMatch = async () => {
    if (matchingIndices.length === 0) return;

    const isAtLastLoadedMatch =
      currentMatchIndex === matchingIndices.length - 1;

    if (isAtLastLoadedMatch && hasNextSearchPage && !isFetchingNextSearchPage) {
      try {
        const result = await fetchNextSearchPage();

        if (result.isError) {
          Alert.alert(
            "Search error",
            "Unable to load more results. Please try again.",
          );
          return;
        }

        const loadedPages = result.data?.pages ?? [];
        const previousMatchCount = loadedPages
          .slice(0, -1)
          .reduce((total, page) => total + page.items.length, 0);

        const newPageMatchCount =
          loadedPages[loadedPages.length - 1]?.items.length ?? 0;

        if (newPageMatchCount > 0) {
          setCurrentMatchIndex(previousMatchCount);
        }
      } catch {
        Alert.alert(
          "Search error",
          "Unable to load more results. Please try again.",
        );
      }

      return;
    }

    setCurrentMatchIndex((previous) =>
      previous + 1 < matchingIndices.length ? previous + 1 : previous,
    );
  };

  const handlePrevMatch = () => {
    if (matchingIndices.length === 0) return;

    setCurrentMatchIndex((previous) =>
      previous > 0 ? previous - 1 : previous,
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
    // Prevent overlapping send and edit operations
    if (!draftReady || sendInFlightRef.current || isSending || isEditingMessage) {
      return;
    }

    // EDIT MODE: Update an existing message instead of sending a new one
    if (editingMessage) {
      if (
        isContactBlocked ||
        isBlockStatusLoading ||
        isBlockStatusUnavailable
      ) {
        return;
      }

      if (selectedImageUris.length > 0) {
        Alert.alert(
          "Attachments selected",
          "Please remove your pending image attachments before saving this edit.",
        );
        return;
      }

      const editDraft = messageText;
      const updatedText = editDraft.trim();

      if (!updatedText) {
        Alert.alert("Invalid message", "Message text cannot be empty.");
        return;
      }

      if (updatedText.length > 4000) {
        Alert.alert(
          "Message too long",
          "A message cannot exceed 4000 characters.",
        );
        return;
      }

      if (updatedText === (editingMessage.text ?? "")) {
        setEditingMessage(null);
        setMessageText("");
        return;
      }

      sendInFlightRef.current = true;

      try {
        await editMessage({
          messageId: editingMessage.id,
          payload: {
            text: updatedText,
            expectedVersion: editingMessage.version,
          },
        });

        setEditingMessage(current => current?.id === editingMessage.id ? null : current);
        setMessageText(current => current === editDraft ? "" : current);

        console.log("Message edited successfully");
      } catch (error) {
        console.error("EDIT MESSAGE ERROR:", error);

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 409) {
            const errorCode = error.response?.data?.code;

            if (errorCode === "MESSAGE_DELETED") {
              Alert.alert(
                "Message deleted",
                "This message has already been deleted.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setEditingMessage(null);
                      setMessageText("");

                      queryClient.invalidateQueries({
                        queryKey: ["messages", activeChatId],
                      });
                    },
                  },
                ],
              );

              return;
            }

            Alert.alert(
              "Message changed",
              "This message has been updated since you started editing. Your changes are still in the input.",
              [
                {
                  text: "Keep my draft",
                  style: "cancel",
                },
                {
                  text: "Refresh messages",
                  onPress: async () => {
                    try {
                      await queryClient.invalidateQueries({
                        queryKey: ["messages", activeChatId],
                        refetchType: "all",
                      });

                      // Leave edit mode so we don't reuse the stale version.
                      // Preserve the user's draft in the input.
                      setEditingMessage(null);

                      Alert.alert(
                        "Messages refreshed",
                        "Your draft is still in the input. You can copy it, or select the updated message and choose Edit again.",
                      );
                    } catch (refreshError) {
                      console.error("MESSAGE REFRESH ERROR:", refreshError);

                      Alert.alert(
                        "Refresh failed",
                        "Could not refresh the messages. Your draft has been preserved.",
                      );
                    }
                  },
                },
              ],
            );

            return;
          }

          if (status === 403) {
            Alert.alert(
              "Edit not allowed",
              "You can only edit messages you sent.",
            );
            return;
          }

          if (status === 404) {
            Alert.alert(
              "Message unavailable",
              "This message is no longer available.",
            );
            return;
          }
        }

        Alert.alert(
          "Edit failed",
          "Unable to edit this message. Please try again.",
        );
      } finally {
        sendInFlightRef.current = false;
      }

      return;
    }

    // NORMAL SEND MODE
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
    const replyAtSubmit = replyingToMessage;

    if (!text && selectedImageUris.length === 0) {
      return;
    }

    const submittedImages = [...selectedImageUris];
    realtime.setTyping(false);
    await submit(text, submittedImages, replyAtSubmit?.id, undefined, () => {
      followLatest(true);
      scrollToLatest();
      setMessageText(current => current === draftTextAtSubmit ? "" : current);
      setSelectedImageUris(current => current.filter(uri => !submittedImages.includes(uri)));
      setReplyingToMessage(current => current?.id === replyAtSubmit?.id ? null : current);
    });
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  const handleSendAudio = async (uri: string, durationSec: number) => {
    if (isSending || isEditingMessage || editingMessage || isContactBlocked || isBlockStatusLoading || isBlockStatusUnavailable) return;
    await submit("", [], replyingToMessage?.id, { uri, duration: durationSec });
    // Audio submission never clears text or image drafts.
  };

  const handleCameraCapture = async () => {
    if (isContactBlocked || isBlockStatusLoading) return;
    const photoUri = await takePhoto();
    if (photoUri) {
      setSelectedImageUris((prev) => [...prev, photoUri].slice(0, 10));
    }
  };

  const handleJumpToMessage = async (messageId: string) => {
    if (isJumpingToMessageRef.current) return;

    isJumpingToMessageRef.current = true;
    followLatest(false);

    try {
      // First check the messages already loaded.
      let targetIndex = processedMessages.findIndex(
        (item) => item.type === "message" && item.id === messageId,
      );

      if (targetIndex === -1) {
        // Load older pages until the target is found.
        let canLoadMore = hasNextPage;
        let pages = messagesData?.pages ?? [];

        while (canLoadMore) {
          const result = await fetchNextPage();

          if (result.isError) {
            throw result.error ?? new Error("Failed to load older messages");
          }

          pages = result.data?.pages ?? [];

          const found = pages.some((page) =>
            page.items.some((message) => message.id === messageId),
          );

          if (found) {
            break;
          }

          canLoadMore = Boolean(pages[pages.length - 1]?.pageInfo.hasNextPage);
        }

        // Rebuild the list indices from the newly loaded history.
        const allMessages = pages
          .flatMap((page) => page.items)
          .filter(
            (message, index, array) =>
              array.findIndex((item) => item.id === message.id) === index,
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        const updatedProcessedMessages = processMessages(
          allMessages,
          currentUser?.id,
        ).reverse();

        targetIndex = updatedProcessedMessages.findIndex(
          (item) => item.type === "message" && item.id === messageId,
        );
      }

      if (targetIndex === -1) {
        Alert.alert(
          "Message unavailable",
          "The original message could not be found in this conversation.",
        );
        return;
      }

      // The effect waits for the actual rendered feed before jumping once.
      setPendingJumpMessageId(messageId);
    } catch (error) {
      console.error("JUMP TO MESSAGE ERROR:", error);

      Alert.alert(
        "Unable to find message",
        "Could not load the original message. Please try again.",
      );
    } finally {
      isJumpingToMessageRef.current = false;
    }
  };

  const handleGalleryPick = async () => {
    if (isContactBlocked || isBlockStatusLoading) return;
    const imageUris = await pickImages();
    if (imageUris.length > 0) {
      setSelectedImageUris((prev) => [...new Set([...prev, ...imageUris])].slice(0, 10));
    }
  };

  const handleSelectRecentPhoto = (uri: string) => {
    setSelectedImageUris((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri].slice(0, 10),
    );
  };

  const removeSelectedImage = (uriToRemove: string) => {
    setSelectedImageUris((prev) => prev.filter((uri) => uri !== uriToRemove));
  };

  // Mark incoming messages as delivered while this conversation is active.
  const processDeliveredReceipts = useCallback(async () => {
    if (deliveredInFlightRef.current) return;

    deliveredInFlightRef.current = true;
    const conversationId = activeChatId;

    try {
      while (
        canMarkDeliveredRef.current &&
        activeChatIdRef.current === conversationId
      ) {
        const messageId = latestIncomingMessageIdRef.current;

        if (!messageId || lastDeliveredMessageIdRef.current === messageId) {
          break;
        }

        await markDelivered({ throughMessageId: messageId });
        lastDeliveredMessageIdRef.current = messageId;
      }
    } catch (error) {
      console.error("DELIVERED RECEIPT ERROR:", error);
    } finally {
      deliveredInFlightRef.current = false;
    }
  }, [activeChatId, markDelivered]);

  // Mark incoming messages as read only when the user is at the latest message.
  const processReadReceipts = useCallback(async () => {
    if (readInFlightRef.current) return;

    readInFlightRef.current = true;
    const conversationId = activeChatId;

    try {
      while (
        canMarkReadRef.current &&
        activeChatIdRef.current === conversationId
      ) {
        const messageId = latestIncomingMessageIdRef.current;

        if (!messageId || lastReadMessageIdRef.current === messageId) {
          break;
        }

        await markRead({ throughMessageId: messageId });
        lastReadMessageIdRef.current = messageId;
      }
    } catch (error) {
      console.error("READ RECEIPT ERROR:", error);
    } finally {
      readInFlightRef.current = false;
    }
  }, [activeChatId, markRead]);

  useEffect(() => {
    void processDeliveredReceipts();
  }, [
    processDeliveredReceipts,
    latestIncomingMessage?.id,
    isScreenFocused,
    isAppActive,
    isSearching,
  ]);

  useEffect(() => {
    void processReadReceipts();
  }, [
    processReadReceipts,
    latestIncomingMessage?.id,
    isScreenFocused,
    isAppActive,
    isSearching,
    isAtLatest,
  ]);

  // Mark the conversation as read when viewing its latest messages.
  const lastMarkedConversationRef = useRef<string | null>(null);
  const conversationReadInFlightRef = useRef(false);

  useEffect(() => {
    if (
      !isScreenFocused ||
      !isAppActive ||
      isSearching ||
      !isAtLatest ||
      !messagesData ||
      !currentUser?.id ||
      !id
    ) {
      return;
    }

    const readKey = `${activeChatId}:${latestIncomingMessage?.id ?? "empty"}`;

    if (
      conversationReadInFlightRef.current ||
      lastMarkedConversationRef.current === readKey
    ) {
      return;
    }

    conversationReadInFlightRef.current = true;

    void markConversationAsRead()
      .then(() => {
        lastMarkedConversationRef.current = readKey;
      })
      .catch((error) => {
        console.error("MARK CONVERSATION READ ERROR:", error);
      })
      .finally(() => {
        conversationReadInFlightRef.current = false;
      });
  }, [
    activeChatId,
    id,
    currentUser?.id,
    messagesData,
    latestIncomingMessage?.id,
    isScreenFocused,
    isAppActive,
    isSearching,
    isAtLatest,
    markConversationAsRead,
  ]);
  
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);

      return () => {
        setIsScreenFocused(false);
      };
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setIsAppActive(nextState === "active");
    });

    return () => {
      subscription.remove();
    };
  }, []);
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

  if (!activeChatId) return <RecoveryState message="Invalid destination: this link has no conversation ID." back={() => router.replace("/(tabs)")} />;

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
          realtimeSubtitle={realtime.typingUsers.length ? (isGroupChat ? `${realtime.typingUsers.length} typing…` : "Typing…") : realtime.status !== "Connected" ? realtime.status : isGroupChat ? undefined : otherParticipant && realtime.participants[otherParticipant.id] === "online" ? "Online" : "Offline"}
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

          {/* Chat Feed / Search States */}
          {isSearching &&
          normalizedSearchQuery.length > 0 &&
          (isSearchLoading || showSearchError || showNoSearchResults) ? (
            <View style={styles.searchStateContainer}>
              {isSearchLoading ? (
                <Typography size={14} color={themeColors.textSecondary}>
                  Searching messages...
                </Typography>
              ) : showSearchError ? (
                <>
                  <Typography size={14} color={themeColors.textSecondary}>
                    Unable to search messages. Please check your connection and
                    try again.
                  </Typography>

                  <TouchableOpacity
                    onPress={() => refetchSearchMessages()}
                    activeOpacity={0.7}
                    style={styles.searchRetryButton}
                  >
                    <Typography
                      size={14}
                      weight="bold"
                      color={themeColors.primary}
                    >
                      Try again
                    </Typography>
                  </TouchableOpacity>
                </>
              ) : (
                <Typography size={14} color={themeColors.textSecondary}>
                  No messages found for "{normalizedSearchQuery}".
                </Typography>
              )}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              inverted
              data={processedMessages}
              keyExtractor={(item) => item.id}
              onScroll={handleMessageScroll}
              scrollEventThrottle={16}
              contentInsetAdjustmentBehavior="never"
              onContentSizeChange={() => {
                if (followingLatestRef.current) scrollToLatest();
              }}
              onLayout={() => {
                if (followingLatestRef.current) scrollToLatest();
              }}
              onScrollBeginDrag={() => {
                userScrollingRef.current = true;
                followLatest(false);
              }}
              onScrollEndDrag={() => { userScrollingRef.current = false; }}
              onMomentumScrollBegin={() => { userScrollingRef.current = true; }}
              onMomentumScrollEnd={event => {
                handleMessageScroll(event);
                userScrollingRef.current = false;
                if (followingLatestRef.current) scrollToLatest();
              }}
              maintainVisibleContentPosition={!followingLatest ? {
                minIndexForVisible: 0,
              } : undefined}
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
                    receiptStatus={receiptStatusByMessageId.get(item.id)}
                    onRetry={() => { void retry(item.clientMessageId); }}
                    retryDisabled={isSending || isContactBlocked || isBlockStatusUnavailable || isBlockStatusLoading}
                    onLongPress={
                      !item.deletedAt && !item.localDelivery
                        ? (position) => handleMessageLongPress(item, position)
                        : undefined
                    }
                    currentUserId={currentUser?.id}
                    onJumpToMessage={handleJumpToMessage}
                    isHighlighted={highlightedMessageId === item.id}
                    onRemoveReaction={handleRemoveReaction}
                    isRemovingReaction={isRemovingReaction}
                  />
                );
              }}
              contentContainerStyle={{
                paddingVertical: 10,
                flexGrow: 1,
                justifyContent: "flex-start",
              }}
            />
          )}
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
                    accessibilityRole="button"
                    accessibilityLabel="Remove attached photo"
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
            onChangeText={text => { setMessageText(text); realtime.setTyping(text.trim().length > 0); }}
            onSendText={handleSend}
            onSendAudio={handleSendAudio}
            onOpenAttachment={() => setAttachmentVisible(true)}
            hasAttachments={selectedImageUris.length > 0}
            isSending={!draftReady || isSending || isEditingMessage}
            isEditing={Boolean(editingMessage)}
            onCancelEdit={handleCancelEdit}
            replyingToMessage={replyingToMessage}
            onCancelReply={handleCancelReply}
          />
        )}
        <MessageActionsSheet
          visible={showMessageActions}
          position={messagePosition}
          isOwnMessage={selectedMessage?.senderId === currentUser?.id}
          onClose={handleCloseMessageActions}
          onReply={handleReplyToMessage}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          onReact={handleReactToMessage}
        />
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
  searchStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  searchRetryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

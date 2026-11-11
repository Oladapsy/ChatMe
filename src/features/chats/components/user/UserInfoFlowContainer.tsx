import { useConversationMute } from "@/features/chats/hooks/useConversationMute";
import React, { useState } from "react";
import { Alert } from "react-native";
import { UserProfile } from "@/features/chats/types/chat";
import { UserProfileDetailScreen } from "@/features/chats/components/user/UserProfileDetailScreen";
import type { StarredMessage } from "@/features/chats/types/starredMsg";
import {
  ChatSharedLinksScreen,
  SharedLinkSection,
} from "@/features/chats/screen/ChatSharedLinksScreen";
import { ChatStarredMessagesScreen } from "@/features/chats/screen/ChatStarredMessagesScreen";
import { ChatPhotosScreen } from "@/features/chats/screen/ChatPhotosScreen";
import { useRouter } from "expo-router";

// Block hooks
import { useBlockedUsers } from "@/features/contacts/hooks/useBlockedUsers";
import { useBlockUser } from "@/features/contacts/hooks/useBlockUser";
import { useUnblockUser } from "@/features/contacts/hooks/useUnblockUser";
import { useClearConversationMessages } from "@/features/chats/hooks/useClearConversationMessages";

type ActiveTab = "Main" | "Photo" | "Star" | "Links";

interface Props {
  profile: UserProfile;
  conversationId?: string;
  starredMessages: StarredMessage[];
  sharedLinkSections: SharedLinkSection[];
  onBack: () => void;
  onQrPress: () => void;
  onSearchPress?: () => void;
}

export function UserInfoFlowContainer({
  profile: initialProfile,
  conversationId,
  starredMessages,
  sharedLinkSections,
  onBack,
  onQrPress,
  onSearchPress,
}: Props) {
  const router = useRouter();
  const { clearMessages, isClearingMessages } = useClearConversationMessages(
    conversationId ?? "",
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("Main");

  // 1. Maintain local profile state (specifically tracking isMuted)
  const isMuted = initialProfile.isMuted;
  const { mute, unmute, isPending: changingMute } = useConversationMute();

  // 2. Block/Unblock hooks setup
  const { data: blockedData, isLoading: isLoadingBlocks } = useBlockedUsers();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const isBlocked =
    blockedData?.items.some((item) => item.user.id === initialProfile.id) ??
    false;

  const isBlockActionPending =
    blockMutation.isPending || unblockMutation.isPending;

  const handleClearChat = () => {
    if (!conversationId || isClearingMessages) return;

    Alert.alert(
      "Clear this chat?",
      "Your message history will be cleared from this conversation. This won't delete messages for the other person.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Chat",
          style: "destructive",
          onPress: async () => {
            try {
              await clearMessages();

              router.replace({
                pathname: "/chat-room",
                params: { id: conversationId },
              });
            } catch (error) {
              console.error("CLEAR CHAT ERROR:", error);

              Alert.alert("Unable to clear chat", "Please try again.");
            }
          },
        },
      ],
    );
  };

  const handleBlockPress = () => {
    if (isLoadingBlocks || isBlockActionPending) return;

    const userId = initialProfile.id;
    const userName = initialProfile.name;

    if (isBlocked) {
      Alert.alert("Unblock contact", `Do you want to unblock ${userName}?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unblock",
          onPress: () => {
            unblockMutation.mutate(userId, {
              onSuccess: () =>
                Alert.alert("Success", `${userName} has been unblocked.`),
              onError: () =>
                Alert.alert("Error", "Unable to unblock this contact."),
            });
          },
        },
      ]);
      return;
    }

    Alert.alert(
      "Block contact",
      `Are you sure you want to block ${userName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            blockMutation.mutate(userId, {
              onSuccess: () =>
                Alert.alert("Success", `${userName} has been blocked.`),
              onError: () =>
                Alert.alert("Error", "Unable to block this contact."),
            });
          },
        },
      ],
    );
  };

  const handleSelectTab = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
  };

  // 3. Toggle handler: turning switch ON means notifications are active -> isMuted becomes false
  const handleToggleNotifications = (isNotificationsEnabled: boolean) => {
    if (!conversationId || changingMute) return;
    const options = { onError: () => Alert.alert("Notifications unchanged", "Couldn't save this setting. Please try again.") };
    if (isNotificationsEnabled) unmute(conversationId, options);
    else mute({ conversationId, duration: "always" }, options);
  };

  if (activeTab === "Photo") {
    return (
      <ChatPhotosScreen
        photos={initialProfile.previewPhotos}
        onBack={() => setActiveTab("Main")}
        onSelectTab={handleSelectTab}
      />
    );
  }

  if (activeTab === "Star") {
    return (
      <ChatStarredMessagesScreen
        starredMessages={starredMessages}
        onBack={() => setActiveTab("Main")}
        onSelectTab={handleSelectTab}
        onSearchPress={onSearchPress}
      />
    );
  }

  if (activeTab === "Links") {
    return (
      <ChatSharedLinksScreen
        sections={sharedLinkSections}
        onBack={() => setActiveTab("Main")}
        onSelectTab={handleSelectTab}
        onSearchPress={onSearchPress}
      />
    );
  }

  return (
    <UserProfileDetailScreen
      profile={{
        ...initialProfile,
        isMuted,
      }}
      isBlocked={isBlocked}
      isBlockActionPending={isBlockActionPending || isLoadingBlocks}
      onBack={onBack}
      onSearchPress={() => {
        if (!conversationId) return;

        router.push({
          pathname: "/chat-room",
          params: {
            id: conversationId,
            search: "true", // Tells ChatRoomScreen to open directly in search mode
          },
        });
      }}
      onQrPress={onQrPress}
      onMessagePress={onBack}
      onPhotosPress={() => setActiveTab("Photo")}
      onStarredPress={() => setActiveTab("Star")}
      onLinksPress={() => setActiveTab("Links")}
      onToggleNotifications={handleToggleNotifications}
      onBlockPress={handleBlockPress}
      onClearChat={handleClearChat}
      isClearingChat={isClearingMessages}
    />
  );
}

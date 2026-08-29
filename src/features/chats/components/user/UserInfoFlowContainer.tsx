import React, { useState } from "react";
import { UserProfile } from "@/features/chats/types/chat";
import { UserProfileDetailScreen } from "@/features/chats/components/user/UserProfileDetailScreen";
import { StarredMessage } from "@/features/chats/components/StarredMsgItem";
import {
  ChatSharedLinksScreen,
  SharedLinkSection,
} from "@/features/chats/screen/ChatSharedLinksScreen";
import { ChatStarredMessagesScreen } from "@/features/chats/screen/ChatStarredMessagesScreen";
import { ChatPhotosScreen } from "@/features/chats/screen/ChatPhotosScreen";
import { useRouter } from "expo-router";

type ActiveTab = "Main" | "Photo" | "Star" | "Links";

interface Props {
  profile: UserProfile;
  starredMessages: StarredMessage[];
  sharedLinkSections: SharedLinkSection[];
  onBack: () => void;
  onQrPress: () => void;
  onSearchPress?: () => void;
}

export function UserInfoFlowContainer({
  profile: initialProfile,
  starredMessages,
  sharedLinkSections,
  onBack,
  onQrPress,
  onSearchPress,
}: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>("Main");

  // 1. Maintain local profile state (specifically tracking isMuted)
  const [isMuted, setIsMuted] = useState(initialProfile.isMuted);

  const handleSelectTab = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
  };

  // 2. Toggle handler: turning switch ON means notifications are active -> isMuted becomes false
  const handleToggleNotifications = (isNotificationsEnabled: boolean) => {
    setIsMuted(!isNotificationsEnabled);
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
      onBack={onBack}
       onSearchPress={() =>
          router.push({
            pathname: "/chat-room",
            params: {
              id: initialProfile.id,
              search: "true", // Tells ChatRoomScreen to open directly in search mode
            },
          })
        }
      onQrPress={onQrPress}
      onMessagePress={onBack}
      onPhotosPress={() => setActiveTab("Photo")}
      onStarredPress={() => setActiveTab("Star")}
      onLinksPress={() => setActiveTab("Links")}
      onToggleNotifications={handleToggleNotifications}
      onBlockPress={() => console.log("Block pressed")}
    />
  );
}

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
  profile,
  starredMessages,
  sharedLinkSections,
  onBack,
  onQrPress,
  onSearchPress,
}: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("Main");

  const handleSelectTab = (tab: "Photo" | "Star" | "Links") => {
    setActiveTab(tab);
  };

  if (activeTab === "Photo") {
    return (
      <ChatPhotosScreen
        photos={profile.previewPhotos}
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
      profile={profile}
      onBack={onBack}
      onSearchPress={onSearchPress || (() => {})}
      onQrPress={onQrPress}
      onMessagePress={onBack}
      onPhotosPress={() => setActiveTab("Photo")}
      onStarredPress={() => setActiveTab("Star")}
      onLinksPress={() => setActiveTab("Links")}
      onToggleNotifications={(val) => console.log("Toggle Notifications:", val)}
      onBlockPress={() => console.log("Block pressed")}
    />
  );
}

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { UserProfile } from "@/features/chats/types/chat";
import { UserProfileDetailScreen } from "./UserProfileDetailScreen";
import { StarredMessage } from "@/features/chats/components/StarredMsgItem";
import { GroupSharedLinksScreen, SharedLinkSection } from "../../screen/GroupSharedLinksScreen";
import { GroupPhotosScreen } from "../../screen/GroupPhotosScreen";
import { GroupStarredMessagesScreen } from "../../screen/GroupStarredMessagesScreen";

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
      <GroupPhotosScreen
        photos={profile.previewPhotos}
        onBack={() => setActiveTab("Main")}
        onSelectTab={handleSelectTab}
        // onSearchPress={onSearchPress}
      />
    );
  }

  if (activeTab === "Star") {
    return (
      <GroupStarredMessagesScreen
        starredMessages={starredMessages}
        onBack={() => setActiveTab("Main")}
        onSelectTab={handleSelectTab}
        onSearchPress={onSearchPress}
      />
    );
  }

  if (activeTab === "Links") {
    return (
      <GroupSharedLinksScreen
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
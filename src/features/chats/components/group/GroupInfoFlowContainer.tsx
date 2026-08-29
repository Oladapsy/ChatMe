import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { GroupDetails } from "@/features/chats/types/chat";
import { GroupDetailScreen } from "@/features/chats/screen/GroupDetailScreen";
import { ChatPhotosScreen } from "@/features/chats/screen/ChatPhotosScreen";
import { ChatStarredMessagesScreen } from "@/features/chats/screen/ChatStarredMessagesScreen";
import { StarredMessage } from "@/features/chats/components/StarredMsgItem";
import {
  ChatSharedLinksScreen,
  SharedLinkSection,
} from "@/features/chats/screen/ChatSharedLinksScreen";

type ActiveScreen = "details" | "photos" | "stars" | "links";

interface Props {
  groupDetails: GroupDetails;
  starredMessages?: StarredMessage[];
  sharedLinkSections?: SharedLinkSection[];
  onBack: () => void;
}

export function GroupInfoFlowContainer({
  groupDetails,
  starredMessages = [],
  sharedLinkSections = [],
  onBack,
}: Props) {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>("details");

  const handleTabSwitch = (tab: "Photo" | "Star" | "Links") => {
    if (tab === "Photo") setCurrentScreen("photos");
    if (tab === "Star") setCurrentScreen("stars");
    if (tab === "Links") setCurrentScreen("links");
  };

  return (
    <View style={styles.container}>
      {currentScreen === "details" && (
        <GroupDetailScreen
          groupDetails={groupDetails}
          onBack={onBack}
          onNavigatePhotos={() => setCurrentScreen("photos")}
          onNavigateStars={() => setCurrentScreen("stars")}
          onNavigateLinks={() => setCurrentScreen("links")}
        />
      )}

      {currentScreen === "photos" && (
        <ChatPhotosScreen
          photos={groupDetails.recentPhotos}
          onBack={() => setCurrentScreen("details")}
          onSelectTab={handleTabSwitch}
        />
      )}

      {currentScreen === "stars" && (
        <ChatStarredMessagesScreen
          starredMessages={starredMessages}
          onBack={() => setCurrentScreen("details")}
          onSelectTab={handleTabSwitch}
        />
      )}

      {currentScreen === "links" && (
        <ChatSharedLinksScreen
          sections={sharedLinkSections}
          onBack={() => setCurrentScreen("details")}
          onSelectTab={handleTabSwitch}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

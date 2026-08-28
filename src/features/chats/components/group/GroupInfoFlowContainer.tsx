import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { GroupDetails } from "@/features/chats/types/chat";
import { GroupDetailScreen } from "@/features/chats/screen/GroupDetailScreen";
import { GroupPhotosScreen } from "@/features/chats/screen/GroupPhotosScreen";
import {
  GroupStarredMessagesScreen,
  StarredMessage,
} from "@/features/chats/screen/GroupStarredMessagesScreen";
import {
  GroupSharedLinksScreen,
  SharedLinkSection,
} from "@/features/chats/screen/GroupSharedLinksScreen";

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
        <GroupPhotosScreen
          photos={groupDetails.recentPhotos}
          onBack={() => setCurrentScreen("details")}
          onSelectTab={handleTabSwitch}
        />
      )}

      {currentScreen === "stars" && (
        <GroupStarredMessagesScreen
          starredMessages={starredMessages}
          onBack={() => setCurrentScreen("details")}
          onSelectTab={handleTabSwitch}
        />
      )}

      {currentScreen === "links" && (
        <GroupSharedLinksScreen
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

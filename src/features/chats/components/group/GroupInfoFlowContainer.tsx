import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { GroupDetails } from "@/features/chats/types/chat";
import { GroupDetailScreen } from "@/features/chats/screen/GroupDetailScreen";
import { ChatPhotosScreen } from "@/features/chats/screen/ChatPhotosScreen";
import { ChatStarredMessagesScreen } from "@/features/chats/screen/ChatStarredMessagesScreen";
import { StarredMessage } from "@/features/chats/types/starredMsg";
import {
  ChatSharedLinksScreen,
  SharedLinkSection,
} from "@/features/chats/screen/ChatSharedLinksScreen";
import { EditGroupScreen } from "@/features/chats/screen/EditGroupScreen";
import type { SelectedImage } from "@/features/contacts/components/AvatarPicker";

type ActiveScreen = "details" | "photos" | "stars" | "links" | "edit";
type MemberRole = "owner" | "admin" | "member";

interface Props {
  groupDetails: GroupDetails;
  currentUserRole?: MemberRole;
  starredMessages?: StarredMessage[];
  sharedLinkSections?: SharedLinkSection[];
  onBack: () => void;
  onSaveGroup?: (values: {
    name: string;
    selectedAvatar?: SelectedImage;
  }) => Promise<void>;
  savingGroup?: boolean;
  onLeaveGroup?: () => void;
  leavingGroup?: boolean;
}

export function GroupInfoFlowContainer({
  groupDetails,
  starredMessages = [],
  sharedLinkSections = [],
  onBack,
  onSaveGroup,
  savingGroup = false,
  currentUserRole,
  onLeaveGroup,
  leavingGroup = false,
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
          currentUserRole={currentUserRole}
          onLeaveGroup={onLeaveGroup}
          leavingGroup={leavingGroup}
          onBack={onBack}
          onNavigatePhotos={() => setCurrentScreen("photos")}
          onNavigateStars={() => setCurrentScreen("stars")}
          onNavigateLinks={() => setCurrentScreen("links")}
          onEditGroup={() => setCurrentScreen("edit")}
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

      {currentScreen === "edit" && (
        <EditGroupScreen
          groupDetails={groupDetails}
          saving={savingGroup}
          onBack={() => setCurrentScreen("details")}
          onSave={async (values) => {
            if (!onSaveGroup) return;

            try {
              await onSaveGroup(values);
              setCurrentScreen("details");
            } catch {
              // Keep the edit screen open so the user can retry.
            }
          }}
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

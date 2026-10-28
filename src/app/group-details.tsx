import React, { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { uploadMedia } from "@/services/mediaUpload";
import {
  useUpdateGroup,
  useGroupDetails,
} from "@/features/chats/hooks/useCreateGroup";
import { useLeaveGroup } from "@/features/chats/hooks/useGroupMemberMutations";
import type { SelectedImage } from "@/features/contacts/components/AvatarPicker";

import { GroupInfoFlowContainer } from "@/features/chats/components/group/GroupInfoFlowContainer";
import {
  MOCK_SHARED_LINK_SECTIONS,
  MOCK_STARRED_MESSAGES,
} from "@/features/chats/data/mockGroupDetails";
import { mapGroupConversationToDetails } from "@/features/chats/utils/mapGroupConversationToDetails";

export default function GroupDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError, error } = useGroupDetails(id);

  const updateGroupMutation = useUpdateGroup();
  const leaveGroupMutation = useLeaveGroup(id);

  const [saving, setSaving] = useState(false);

  const handleSaveGroup = async ({
    name,
    selectedAvatar,
  }: {
    name: string;
    selectedAvatar?: SelectedImage;
  }) => {
    if (saving) return;

    setSaving(true);

    try {
      let mediaId: string | undefined;

      if (selectedAvatar) {
        const media = await uploadMedia({
          uri: selectedAvatar.uri,
          purpose: "group_avatar",
          contentType: selectedAvatar.mimeType,
          sizeBytes: selectedAvatar.fileSize,
          originalFilename: selectedAvatar.fileName,
        });

        mediaId = media.id;
      }

      await updateGroupMutation.mutateAsync({
        conversationId: id,
        name,
        mediaId,
      });
    } catch (error) {
      console.error("Failed to update group:", error);

      Alert.alert(
        "Update failed",
        "Your changes could not be saved. Please try again.",
      );

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveGroup = () => {
    if (!data || data.type !== "group") return;

    // The backend requires the owner to transfer ownership or delete
    // the group before leaving.
    if (data.role === "owner") {
      Alert.alert(
        "Transfer ownership first",
        "You're the group owner. Transfer ownership to another member before leaving this group.",
      );
      return;
    }

    Alert.alert(
      "Leave group?",
      `You'll no longer be a member of "${data.name}". You may need to be added again to rejoin.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave group",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveGroupMutation.mutateAsync();

              // Return to the previous screen after the API succeeds.
              // Ensure this previous screen is your conversations list.
              router.back();
            } catch (error) {
              console.error("Failed to leave group:", error);

              Alert.alert(
                "Unable to leave group",
                error instanceof Error ? error.message : "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (isError || !data) {
    console.error("Failed to fetch group details:", error);
    return null;
  }

  if (data.type !== "group") {
    console.error("The requested conversation is not a group.");
    return null;
  }

  const groupDetails = mapGroupConversationToDetails(data);

  return (
    <GroupInfoFlowContainer
      groupDetails={groupDetails}
      currentUserRole={data.role}
      starredMessages={MOCK_STARRED_MESSAGES}
      sharedLinkSections={MOCK_SHARED_LINK_SECTIONS}
      onBack={() => router.back()}
      savingGroup={saving}
      onSaveGroup={handleSaveGroup}
      onLeaveGroup={handleLeaveGroup}
      leavingGroup={leaveGroupMutation.isPending}
    />
  );
}

import React, { useState } from "react";
import { Alert } from "react-native";
import { uploadMedia } from "@/services/mediaUpload";
import { useUpdateGroup } from "@/features/chats/hooks/useCreateGroup";
import type { SelectedImage } from "@/features/contacts/components/AvatarPicker";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { GroupInfoFlowContainer } from "@/features/chats/components/group/GroupInfoFlowContainer";
import {
  MOCK_SHARED_LINK_SECTIONS,
  MOCK_STARRED_MESSAGES,
} from "@/features/chats/data/mockGroupDetails";
import { useGroupDetails } from "@/features/chats/hooks/useCreateGroup";
import { mapGroupConversationToDetails } from "@/features/chats/utils/mapGroupConversationToDetails";

export default function GroupDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError, error } = useGroupDetails(id);

  // update group hook
  const updateGroupMutation = useUpdateGroup();
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

  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
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
      starredMessages={MOCK_STARRED_MESSAGES}
      sharedLinkSections={MOCK_SHARED_LINK_SECTIONS}
      onBack={() => router.back()}
      savingGroup={saving}
      onSaveGroup={handleSaveGroup}
    />
  );
}

import { goBackOrHome } from "@/shared/utils/goBackOrHome";
import { RecoveryState } from "@/shared/components/RecoveryState";
import React, { useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { uploadMedia } from "@/services/mediaUpload";
import {
  useUpdateGroup,
  useGroupDetails,
} from "@/features/chats/hooks/useCreateGroup";
import { useLeaveGroup } from "@/features/chats/hooks/useGroupMemberMutations";
import { useDeleteGroup } from "@/features/chats/hooks/useDeleteGroup";
import type { SelectedImage } from "@/features/contacts/components/AvatarPicker";

import { GroupInfoFlowContainer } from "@/features/chats/components/group/GroupInfoFlowContainer";

import { mapGroupConversationToDetails } from "@/features/chats/utils/mapGroupConversationToDetails";
import { useClearConversationMessages } from "@/features/chats/hooks/useClearConversationMessages";

export default function GroupDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isPending, isError, error, refetch } = useGroupDetails(id);

  const { clearMessages, isClearingMessages } =
    useClearConversationMessages(id);

  const updateGroupMutation = useUpdateGroup();
  const leaveGroupMutation = useLeaveGroup(id);
  const deleteGroupMutation = useDeleteGroup(id);

  const [saving, setSaving] = useState(false);

  const handleClearGroupChat = () => {
    if (!id || isClearingMessages) return;

    Alert.alert(
      "Clear group chat?",
      "This will clear the group's message history for you only. Other members will still see their messages, and you'll remain in the group.",
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
                params: { id },
              });
            } catch (error) {
              console.error("CLEAR GROUP CHAT ERROR:", error);

              Alert.alert("Unable to clear group chat", "Please try again.");
            }
          },
        },
      ],
    );
  };

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
              router.replace("/(tabs)");
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

  const handleDeleteGroup = () => {
    if (!data || data.type !== "group" || data.role !== "owner") {
      return;
    }

    Alert.alert(
      "Delete group?",
      `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete group",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroupMutation.mutateAsync();
              router.replace("/(tabs)");
            } catch (error) {
              console.error("Failed to delete group:", error);

              Alert.alert(
                "Unable to delete group",
                error instanceof Error ? error.message : "Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  if (!id) return <RecoveryState message="Invalid destination: this link has no group ID." back={() => router.replace("/(tabs)")} />;

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
    return <RecoveryState message="This group couldn't be loaded. It may be unavailable, or you may be offline." retry={() => { void refetch(); }} back={() => router.replace("/(tabs)")} />;
  }

  if (data.type !== "group") {
    return <RecoveryState message="Invalid destination: this conversation is not a group." back={() => router.replace("/(tabs)")} />;
  }

  const groupDetails = mapGroupConversationToDetails(data);

  return (
    <GroupInfoFlowContainer
      groupDetails={groupDetails}
      currentUserRole={data.role}
      starredMessages={[]}
      sharedLinkSections={[]}
      onBack={() => goBackOrHome(router)}
      savingGroup={saving}
      onSaveGroup={handleSaveGroup}
      onLeaveGroup={handleLeaveGroup}
      leavingGroup={leaveGroupMutation.isPending}
      onDeleteGroup={handleDeleteGroup}
      deletingGroup={deleteGroupMutation.isPending}
      onClearChat={handleClearGroupChat}
      isClearingChat={isClearingMessages}
    />
  );
}

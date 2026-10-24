import React from "react";
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
    />
  );
}

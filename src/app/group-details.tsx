import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GroupInfoFlowContainer } from "@/features/chats/components/group/GroupInfoFlowContainer";
import {
  getMockGroupDetails,
  MOCK_SHARED_LINK_SECTIONS,
  MOCK_STARRED_MESSAGES,
} from "@/features/chats/data/mockGroupDetails";

export default function GroupDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const mockGroupDetails = getMockGroupDetails(id);

  return (
   <GroupInfoFlowContainer
      groupDetails={mockGroupDetails}
      starredMessages={MOCK_STARRED_MESSAGES}
      sharedLinkSections={MOCK_SHARED_LINK_SECTIONS}
      onBack={() => router.back()}
    />
  );
}
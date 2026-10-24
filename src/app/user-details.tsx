import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserInfoFlowContainer } from "@/features/chats/components/user/UserInfoFlowContainer";
import { MOCK_USER_PROFILE } from "@/features/chats/data/mockUserProfile";
import {
  MOCK_STARRED_MESSAGES,
  MOCK_SHARED_LINK_SECTIONS,
} from "@/features/chats/data/mockGroupDetails";

export default function UserDetailsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    conversationId?: string;
    name?: string;
    avatar?: string;
  }>();

  if (!params.id) {
    return null;
  }

  const profile = {
    ...MOCK_USER_PROFILE,
    id: params.id,
    name: params.name || "ChatMe user",
    avatarUri: params.avatar || undefined,
  };

  return (
    <UserInfoFlowContainer
      profile={profile}
      conversationId={params.conversationId}
      starredMessages={MOCK_STARRED_MESSAGES}
      sharedLinkSections={MOCK_SHARED_LINK_SECTIONS}
      onBack={() => router.back()}
      onQrPress={() =>
        router.push({
          pathname: "/user-qr",
          params: {
            name: profile.name,
            phone: profile.phone,
            avatarUri: profile.avatarUri,
            qrValue: profile.qrValue,
          },
        })
      }
      onSearchPress={() => console.log("the search activated")}
    />
  );
}

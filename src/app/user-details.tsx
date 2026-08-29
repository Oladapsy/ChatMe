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
    name?: string;
    avatar?: string;
  }>();

  const profile = {
    ...MOCK_USER_PROFILE,
    id: params.id || MOCK_USER_PROFILE.id,
    name: params.name || MOCK_USER_PROFILE.name,
    avatarUri: params.avatar || MOCK_USER_PROFILE.avatarUri,
  };

  return (
    <UserInfoFlowContainer
      profile={profile}
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
    />
  );
}
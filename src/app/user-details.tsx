import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

import { UserInfoFlowContainer } from "@/features/chats/components/user/UserInfoFlowContainer";
import { useConversation } from "@/features/chats/hooks/useConversation";

import {
  MOCK_STARRED_MESSAGES,
  MOCK_SHARED_LINK_SECTIONS,
} from "@/features/chats/data/mockGroupDetails";
import { Typography } from "@/shared/components/Typography";

export default function UserDetailsRoute() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    conversationId?: string;
    name?: string;
    avatar?: string;
  }>();

  const {
    data: conversation,
    isLoading,
    isError,
    refetch,
  } = useConversation(params.conversationId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError || !conversation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Typography size={16}>Unable to load this conversation.</Typography>
        <TouchableOpacity onPress={() => refetch()}>
          <Typography size={14} weight="bold">
            Try again
          </Typography>
        </TouchableOpacity>
      </View>
    );
  }

  if (conversation.type !== "direct") {
    router.back();
    return null;
  }

  const participant = conversation.otherParticipant;

  // Verify that the profile route refers to this conversation's participant.
  if (params.id && params.id !== participant.id) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Typography size={16}>
          The selected contact doesn't match this conversation.
        </Typography>
      </View>
    );
  }

  const profile = {
    id: participant.id,
    name: participant.displayName || "ChatMe user",
    avatarUri: participant.avatarUrl || undefined,

    // Temporary values until we connect the relevant endpoints.
    lastSeen: "",
    phone: "",
    description: "",
    photoCount: 0,
    previewPhotos: [],
    starCount: 0,
    linkCount: 0,
    isMuted: conversation.settings.muted,
    isBlocked: false,
    qrValue: participant.id,
  };

  return (
    <UserInfoFlowContainer
      profile={profile}
      conversationId={conversation.id}
      starredMessages={MOCK_STARRED_MESSAGES}
      sharedLinkSections={MOCK_SHARED_LINK_SECTIONS}
      onBack={() => router.back()}
      onQrPress={() =>
        router.push({
          pathname: "/user-qr",
          params: {
            name: profile.name,
            phone: profile.phone,
            avatarUri: profile.avatarUri ?? "",
            qrValue: profile.qrValue,
          },
        })
      }
      onSearchPress={() =>
        console.log("search pressed")
      }
    />
  );
}

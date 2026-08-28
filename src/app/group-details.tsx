import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GroupInfoFlowContainer } from "@/features/chats/components/group/GroupInfoFlowContainer";

export default function GroupDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mock group data for testing!!!
  const mockGroupDetails = {
    id: id || "1",
    name: "Work Team",
    description:
      "Massa massa, ultrices morbi tortor et in cursus ultrices sem dignissim nunc, tortor aenean aliquet faucibus habitasse risee Massa massa, ultrices morbi tortor et in cursus ultrices sem dignissim nunc, tortor aenean aliquet faucibus habitasse",
    coverImageUri: "https://picsum.photos/800/600",
    photosCount: 2238,
    starMessagesCount: 43,
    sharedLinksCount: 19,
    recentPhotos: [
      "https://picsum.photos/300/300?random=1",
      "https://picsum.photos/300/300?random=2",
      "https://picsum.photos/300/300?random=3",
      "https://picsum.photos/300/300?random=4",
      "https://picsum.photos/300/300?random=5",
      "https://picsum.photos/300/300?random=6",
      "https://picsum.photos/300/300?random=7",
      "https://picsum.photos/300/300?random=8",
      "https://picsum.photos/300/300?random=9",
    ],
    members: [
      { id: "1", name: "Arlene McCoy", isOnline: true },
      { id: "2", name: "Bessie Cooper", isOnline: false },
      { id: "3", name: "Arlene McCoy", isOnline: true },
      { id: "4", name: "Bessie Cooper", isOnline: false },
      { id: "5", name: "Arlene McCoy", isOnline: true },
      { id: "6", name: "Bessie Cooper", isOnline: false },
      { id: "7", name: "Arlene McCoy", isOnline: true },
      { id: "8", name: "Bessie Cooper", isOnline: false },
      { id: "9", name: "Arlene McCoy", isOnline: true },
      { id: "10", name: "Bessie Cooper", isOnline: false },
    ],
  };

  return (
    <GroupInfoFlowContainer
      groupDetails={mockGroupDetails}
      onBack={() => router.back()}
    />
  );
}

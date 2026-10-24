import type {
  GroupConversation,
  GroupDetails,
} from "@/features/chats/types/chat";

export function mapGroupConversationToDetails(
  conversation: GroupConversation,
): GroupDetails {
  return {
    id: conversation.id,
    name: conversation.name,
    description: "",
    coverImageUri: conversation.avatarUrl ?? undefined,
    photosCount: 0,
    starMessagesCount: 0,
    sharedLinksCount: 0,
    recentPhotos: [],
    members: conversation.participants.map((participant) => ({
      id: participant.id,
      name: participant.displayName ?? "Unknown member",
      avatarUri: participant.avatarUrl ?? undefined,
      role:
        participant.role === "admin" || participant.role === "owner"
          ? "admin"
          : "member",
    })),
  };
}

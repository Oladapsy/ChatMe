import type {
  Conversation,
} from "@/features/chats/types/chat";
import type { Chat } from "@/features/chats/types/chat";

export const mapConversationToChat = (conversation: Conversation): Chat => {
  if (conversation.type === "direct") {
    return {
      id: conversation.id,
      name: conversation.otherParticipant.displayName ?? "Unknown",
      avatar: conversation.otherParticipant.avatarUrl ?? "",
      lastMessage: conversation.latestMessage?.preview ?? "",
      time:
        conversation.latestMessage?.createdAt ?? conversation.lastActivityAt,
      unreadCount: conversation.unreadCount,
      isPinned: conversation.settings.pinned,
      isMuted: conversation.settings.muted,
      isArchived: conversation.settings.archived,
      isGroup: false,
      isFavorited: conversation.settings.favorited,
      lastActivityAt: conversation.lastActivityAt,
    };
  }

  return {
    id: conversation.id,
    name: conversation.name,
    avatar: conversation.avatarUrl ?? "",
    lastMessage: conversation.latestMessage?.preview ?? "",
    time: conversation.latestMessage?.createdAt ?? conversation.lastActivityAt,
    isFavorited: conversation.settings.favorited,
    unreadCount: conversation.unreadCount,
    isPinned: conversation.settings.pinned,
    isMuted: conversation.settings.muted,
    isArchived: conversation.settings.archived,
    isGroup: true,
    lastActivityAt: conversation.lastActivityAt,
    members: conversation.participants.map((participant) => ({
      id: participant.id,
      name: participant.displayName ?? "Unknown",
      avatarUri: participant.avatarUrl ?? undefined,
      role: participant.role === "admin" ? "admin" : "member",
    })),
  };
};

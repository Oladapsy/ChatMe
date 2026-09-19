import { api } from "@/services/api";
import type { ConversationListResponse } from "@/features/chats/types/chat";
import type { MessageHistoryResponse, Message } from "@/features/chats/types/message";

export const getConversations = async (): Promise<ConversationListResponse> => {
  const response = await api.get<ConversationListResponse>("/conversations");

  return response.data;
};

// get archived chats
export const getArchivedConversations =
  async (): Promise<ConversationListResponse> => {
    const response = await api.get<ConversationListResponse>(
      "/conversations/archived",
    );

    return response.data;
  };

// for pin and unpin
export const pinConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.put(`/conversations/${conversationId}/pin`);
};

export const unpinConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/pin`);
};

// mute and unmute conversations
export type MuteDuration = "8_hours" | "24_hours" | "7_days" | "always";

export const muteConversation = async (
  conversationId: string,
  duration: MuteDuration,
): Promise<void> => {
  await api.put(`/conversations/${conversationId}/mute`, {
    duration,
  });
};

export const unmuteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/mute`);
};

// archive and unarchieve
export const archiveConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.put(`/conversations/${conversationId}/archive`);
};

export const unarchiveConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/archive`);
};

// favourite
export const favoriteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.put(`/conversations/${conversationId}/favorite`);
};

export const unfavoriteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/conversations/${conversationId}/favorite`);
};

// get messages for a conversation
export const getMessages = async (
  conversationId: string,
): Promise<MessageHistoryResponse> => {
  const response = await api.get<MessageHistoryResponse>(
    `/conversations/${conversationId}/messages`,
  );

  return response.data;
};

// send messages to a conversation payload
export interface SendMessagePayload {
  clientMessageId: string;
  replyToMessageId?: string;
  text?: string;
  attachmentMediaIds?: string[];
}

// send msgs to a convereation function
export const sendMessage = async (
  conversationId: string,
  payload: SendMessagePayload,
): Promise<Message> => {
  const response = await api.post<Message>(
    `/conversations/${conversationId}/messages`,
    payload,
  );

  return response.data;
};

// get favourites
export const getFavoriteConversations =
  async (): Promise<ConversationListResponse> => {
    const response = await api.get<ConversationListResponse>(
      "/conversations/favorites",
    );

    return response.data;
  };
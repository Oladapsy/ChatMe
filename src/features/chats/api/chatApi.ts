import { api } from "@/services/api";
import type { ConversationListResponse } from "@/features/chats/types/chat";

export const getConversations = async (): Promise<ConversationListResponse> => {
  const response = await api.get<ConversationListResponse>("/conversations");

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
export type MuteDuration =
  | "8_hours"
  | "24_hours"
  | "7_days"
  | "always";

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
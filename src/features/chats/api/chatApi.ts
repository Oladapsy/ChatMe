import { api } from "@/services/api";
import type { ConversationListResponse } from "@/features/chats/types/chat";

export const getConversations = async (): Promise<ConversationListResponse> => {
  const response = await api.get<ConversationListResponse>("/conversations");

  return response.data;
};

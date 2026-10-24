import { api } from "@/services/api";
import type { Conversation } from "@/features/chats/types/chat";

export async function getConversationById(
  conversationId: string,
): Promise<Conversation> {
  const response = await api.get<Conversation>(
    `/conversations/${conversationId}`,
  );

  return response.data;
}

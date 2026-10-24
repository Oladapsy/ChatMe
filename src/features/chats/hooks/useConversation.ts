import { useQuery } from "@tanstack/react-query";
import { getConversationById } from "@/features/chats/api/conversationsApi";

export function useConversation(conversationId?: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationById(conversationId!),
    enabled: Boolean(conversationId),
  });
}
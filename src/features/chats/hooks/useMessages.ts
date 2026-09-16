import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/features/chats/api/chatApi";

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });
};
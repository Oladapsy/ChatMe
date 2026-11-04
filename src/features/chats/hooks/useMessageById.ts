import { useQuery } from "@tanstack/react-query";

import { getMessageById } from "@/features/chats/api/chatApi";

export const useMessageById = (
  conversationId: string,
  messageId: string | null,
) => {
  return useQuery({
    queryKey: ["message", conversationId, messageId],

    queryFn: () => getMessageById(conversationId, messageId!),

    enabled: Boolean(conversationId && messageId),

    staleTime: 30_000,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      if (status === 404) return false;

      return failureCount < 2;
    },
  });
};

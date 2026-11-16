import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";

import { markConversationAsRead } from "@/features/chats/api/chatApi";

export const useMarkConversationAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: () => markConversationAsRead(conversationId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["receipts", conversationId] }),
      ]);
    },
  });
};

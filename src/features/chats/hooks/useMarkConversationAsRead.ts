import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markConversationAsRead } from "@/features/chats/api/chatApi";

export const useMarkConversationAsRead = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markConversationAsRead(conversationId),

    onSuccess: async () => {
      // Refresh the conversation list to update unread badges.
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      // Refresh this conversation's metadata.
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });

      // Refresh participant receipt frontiers.
      await queryClient.invalidateQueries({
        queryKey: ["receipts", conversationId],
      });
    },
  });
};

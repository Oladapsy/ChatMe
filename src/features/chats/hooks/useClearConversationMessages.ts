import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearConversationMessages } from "@/features/chats/api/chatApi";

export const useClearConversationMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => clearConversationMessages(conversationId),

    onSuccess: async () => {
      // Remove cached message history, including older pages.
      queryClient.removeQueries({
        queryKey: ["messages", conversationId],
        exact: true,
      });

      // Clear any cached message search results.
      await queryClient.invalidateQueries({
        queryKey: ["messageSearch", conversationId],
      });

      // Refresh the conversation list (last message/unread state).
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    clearMessages: mutation.mutateAsync,
    isClearingMessages: mutation.isPending,
  };
};

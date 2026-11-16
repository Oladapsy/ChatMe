import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";

import { clearConversationMessages } from "@/features/chats/api/chatApi";

export const useClearConversationMessages = (conversationId: string) => {
  const queryClient = useQueryClient();

  const mutation = useSessionMutation({
    mutationFn: () => clearConversationMessages(conversationId),

    onSuccess: async () => {
      // Remove cached message history, including older pages.
      queryClient.removeQueries({
        queryKey: ["messages", conversationId],
        exact: true,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", "search", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });

  return {
    clearMessages: mutation.mutateAsync,
    isClearingMessages: mutation.isPending,
  };
};

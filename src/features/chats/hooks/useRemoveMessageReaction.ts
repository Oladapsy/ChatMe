
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeMessageReaction } from "@/features/chats/api/chatApi";
import type { MessagesCache } from "@/features/chats/utils/reactionCache";
import { updateCachedMessage } from "@/features/chats/utils/reactionCache";

interface RemoveReactionVariables {
  messageId: string;
  userId: string;
}

export const useRemoveMessageReaction = (conversationId: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["messages", conversationId] as const;

  const mutation = useMutation({
    mutationFn: ({ messageId }: RemoveReactionVariables) =>
      removeMessageReaction(conversationId, messageId),

    onMutate: async ({ messageId, userId }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<MessagesCache>(queryKey);

      queryClient.setQueryData<MessagesCache>(queryKey, (oldData) =>
        updateCachedMessage(oldData, messageId, (message) => ({
          ...message,
          reactions: message.reactions.filter(
            (reaction) => reaction.userId !== userId,
          ),
        })),
      );

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    removeReaction: mutation.mutateAsync,
    isRemovingReaction: mutation.isPending,
  };
};


import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setMessageReaction } from "@/features/chats/api/chatApi";
import type { MessagesCache } from "@/features/chats/utils/reactionCache";
import { updateCachedMessage } from "@/features/chats/utils/reactionCache";

interface SetReactionVariables {
  messageId: string;
  emoji: string;
  userId: string;
}

export const useSetMessageReaction = (conversationId: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["messages", conversationId] as const;

  const mutation = useMutation({
    mutationFn: ({ messageId, emoji }: SetReactionVariables) =>
      setMessageReaction(conversationId, messageId, { emoji }),

    onMutate: async ({ messageId, emoji, userId }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<MessagesCache>(queryKey);

      queryClient.setQueryData<MessagesCache>(queryKey, (oldData) =>
        updateCachedMessage(oldData, messageId, (message) => ({
          ...message,
          reactions: [
            ...message.reactions.filter(
              (reaction) => reaction.userId !== userId,
            ),
            { userId, emoji },
          ],
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
    setReaction: mutation.mutateAsync,
    isSettingReaction: mutation.isPending,
  };
};

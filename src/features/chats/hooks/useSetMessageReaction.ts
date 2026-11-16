import { applyMessageUpdate, messageSearchKey } from "@/features/chats/utils/reconcileMessageSearch";
import { getSessionGeneration } from "@/services/authStorage";
import { SessionChangedError, useSessionMutation } from "@/shared/hooks/useSessionMutation";

import { useQueryClient } from "@tanstack/react-query";

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

  const mutation = useSessionMutation({
    mutationFn: ({ messageId, emoji }: SetReactionVariables) =>
      setMessageReaction(conversationId, messageId, { emoji }),

    onMutate: async ({ messageId, emoji, userId }) => {
      const generation = getSessionGeneration();
      await queryClient.cancelQueries({ queryKey });
      if (generation !== getSessionGeneration()) throw new SessionChangedError();

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

    onSuccess: (message) => {
      applyMessageUpdate(queryClient, conversationId, message);
    },

    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: messageSearchKey(conversationId) });
    },
  });

  return {
    setReaction: mutation.mutateAsync,
    isSettingReaction: mutation.isPending,
  };
};

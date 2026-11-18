import { applyMessageUpdate, messageSearchKey } from "@/features/chats/utils/reconcileMessageSearch";
import { getSessionGeneration } from "@/services/authStorage";
import { SessionChangedError, useSessionMutation } from "@/shared/hooks/useSessionMutation";

import { useQueryClient } from "@tanstack/react-query";

import { removeMessageReaction } from "@/features/chats/api/chatApi";
import { beginReactionPatch, rollbackReactionPatch, confirmReactionPatch } from "@/features/chats/utils/reactionCache";

interface RemoveReactionVariables {
  messageId: string;
  userId: string;
}

export const useRemoveMessageReaction = (conversationId: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["messages", conversationId] as const;

  const mutation = useSessionMutation({
    mutationFn: ({ messageId }: RemoveReactionVariables) =>
      removeMessageReaction(conversationId, messageId),

    onMutate: async ({ messageId, userId }) => {
      const generation = getSessionGeneration();
      await queryClient.cancelQueries({ queryKey });
      if (generation !== getSessionGeneration()) throw new SessionChangedError();

      return beginReactionPatch(queryClient, conversationId, messageId, userId, generation);
    },

    onSuccess: (message, _variables, patch) => {
      confirmReactionPatch(queryClient, conversationId, patch);
      applyMessageUpdate(queryClient, conversationId, message);
    },

    onError: (_error, _variables, patch) => {
      rollbackReactionPatch(queryClient, conversationId, patch);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: messageSearchKey(conversationId) });
    },
  });

  return {
    removeReaction: mutation.mutateAsync,
    isRemovingReaction: mutation.isPending,
  };
};

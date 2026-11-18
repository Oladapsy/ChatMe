import { applyMessageUpdate, messageSearchKey } from "@/features/chats/utils/reconcileMessageSearch";
import { getSessionGeneration } from "@/services/authStorage";
import { SessionChangedError, useSessionMutation } from "@/shared/hooks/useSessionMutation";

import { useQueryClient } from "@tanstack/react-query";

import { setMessageReaction } from "@/features/chats/api/chatApi";
import { beginReactionPatch, rollbackReactionPatch, confirmReactionPatch } from "@/features/chats/utils/reactionCache";

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

      return beginReactionPatch(queryClient, conversationId, messageId, userId, generation, emoji);
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
    setReaction: mutation.mutateAsync,
    isSettingReaction: mutation.isPending,
  };
};

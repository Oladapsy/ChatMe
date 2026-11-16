import { applyMessageUpdate } from "@/features/chats/utils/reconcileMessageSearch";
import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { editMessage, deleteMessage } from "@/features/chats/api/chatApi";
import type { EditMessagePayload } from "@/features/chats/api/chatApi";

export const useMessageActions = (conversationId: string) => {
  const queryClient = useQueryClient();

  // Edit message mutation
  const editMutation = useSessionMutation({
    mutationFn: ({
      messageId,
      payload,
    }: {
      messageId: string;
      payload: EditMessagePayload;
    }) => editMessage(conversationId, messageId, payload),

    onSuccess: (message) => {
      applyMessageUpdate(queryClient, conversationId, message);
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  // Delete message mutation
  const deleteMutation = useSessionMutation({
    mutationFn: (messageId: string) => deleteMessage(conversationId, messageId),

    onSuccess: (message) => {
      applyMessageUpdate(queryClient, conversationId, message);
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    editMessage: editMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,

    isEditingMessage: editMutation.isPending,
    isDeletingMessage: deleteMutation.isPending,
  };
};

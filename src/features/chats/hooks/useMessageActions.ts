import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editMessage, deleteMessage } from "@/features/chats/api/chatApi";
import type { EditMessagePayload } from "@/features/chats/api/chatApi";

export const useMessageActions = (conversationId: string) => {
  const queryClient = useQueryClient();

  // Edit message mutation
  const editMutation = useMutation({
    mutationFn: ({
      messageId,
      payload,
    }: {
      messageId: string;
      payload: EditMessagePayload;
    }) => editMessage(conversationId, messageId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(conversationId, messageId),

    onSuccess: () => {
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

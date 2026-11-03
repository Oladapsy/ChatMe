import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markMessagesDelivered,
  markMessagesRead,
} from "@/features/chats/api/chatApi";
import type { UpdateReceiptPayload } from "@/features/chats/types/message";

export const useUpdateReceipts = (conversationId: string) => {
  const queryClient = useQueryClient();

  const deliveredMutation = useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      markMessagesDelivered(conversationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["receipts", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const readMutation = useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      markMessagesRead(conversationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["receipts", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    markDelivered: deliveredMutation.mutateAsync,
    markRead: readMutation.mutateAsync,
    isMarkingDelivered: deliveredMutation.isPending,
    isMarkingRead: readMutation.isPending,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendMessage,
  type SendMessagePayload,
} from "@/features/chats/api/chatApi";

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      sendMessage(conversationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
  });

  return {
    send: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};

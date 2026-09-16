import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pinConversation,
  unpinConversation,
} from "@/features/chats/api/chatApi";

export const useConversationPin = () => {
  const queryClient = useQueryClient();

  const pinMutation = useMutation({
    mutationFn: pinConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const unpinMutation = useMutation({
    mutationFn: unpinConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    pin: pinMutation.mutate,
    unpin: unpinMutation.mutate,
    isPending: pinMutation.isPending || unpinMutation.isPending,
  };
};
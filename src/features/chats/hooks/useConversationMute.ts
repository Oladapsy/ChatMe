import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  muteConversation,
  unmuteConversation,
  type MuteDuration,
} from "@/features/chats/api/chatApi";

export const useConversationMute = () => {
  const queryClient = useQueryClient();

  const muteMutation = useMutation({
    mutationFn: ({
      conversationId,
      duration,
    }: {
      conversationId: string;
      duration: MuteDuration;
    }) => muteConversation(conversationId, duration),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const unmuteMutation = useMutation({
    mutationFn: unmuteConversation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    mute: muteMutation.mutate,
    unmute: unmuteMutation.mutate,
    isPending:
      muteMutation.isPending || unmuteMutation.isPending,
  };
};
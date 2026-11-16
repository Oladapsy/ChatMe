import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  muteConversation,
  unmuteConversation,
  type MuteDuration,
} from "@/features/chats/api/chatApi";

export const useConversationMute = () => {
  const queryClient = useQueryClient();

  const muteMutation = useSessionMutation({
    mutationFn: ({
      conversationId,
      duration,
    }: {
      conversationId: string;
      duration: MuteDuration;
    }) => muteConversation(conversationId, duration),

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const unmuteMutation = useSessionMutation({
    mutationFn: unmuteConversation,

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
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
import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { startDirectConversation } from "@/features/chats/api/chatApi";

export function useStartDirectConversation() {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: startDirectConversation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

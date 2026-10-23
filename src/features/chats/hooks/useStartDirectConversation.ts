import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startDirectConversation } from "@/features/chats/api/chatApi";

export function useStartDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startDirectConversation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

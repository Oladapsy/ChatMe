import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDirectChatForMe } from "../api/conversationsApi";

// Replace this import with the actual location of your API function.

export function useDeleteDirectChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteDirectChatForMe(conversationId),

    onSuccess: async (_result, conversationId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["conversations", "archived"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["conversations", "favorites"],
        }),
      ]);

      queryClient.removeQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });
    },
  });
}

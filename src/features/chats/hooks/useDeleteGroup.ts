import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/features/chats/api/chatApi";

export function useDeleteGroup(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGroup(conversationId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.removeQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });
    },
  });
}

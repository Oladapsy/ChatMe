import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/features/chats/api/chatApi";

export function useDeleteGroup(conversationId: string) {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: () => deleteGroup(conversationId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

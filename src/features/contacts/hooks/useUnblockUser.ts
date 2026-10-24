import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unblockUser } from "@/features/contacts/api/blocksApi";
import { BLOCKED_USERS_QUERY_KEY } from "@/features/contacts/hooks/useBlockedUsers";

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unblockUser,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: BLOCKED_USERS_QUERY_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user-search"],
        }),
      ]);
    },
  });
}

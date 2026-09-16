import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeAvatar } from "@/features/auth/api/authApi";

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAvatar,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
}

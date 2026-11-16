import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { removeAvatar } from "@/features/auth/api/authApi";

export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: removeAvatar,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
}

import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import { updateAvatar } from "@/features/auth/api/authApi";

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: updateAvatar,

    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
    },
  });
}
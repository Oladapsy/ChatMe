import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAvatar } from "@/features/auth/api/authApi";

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvatar,

    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
    },
  });
}
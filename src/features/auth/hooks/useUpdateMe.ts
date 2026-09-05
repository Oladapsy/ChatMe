import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "@/features/auth/api/authApi";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
}
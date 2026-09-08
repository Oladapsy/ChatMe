import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,

    // onSuccess: async () => {
    //    await queryClient.invalidateQueries({
    //     queryKey: ["me"],
    //   });
    // },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      useAuthStore.getState().setProfileComplete(data.profileComplete);
    },
  });
}

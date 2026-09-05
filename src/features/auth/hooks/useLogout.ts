import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/features/auth/api/authApi";
import { clearSession, getRefreshToken } from "@/services/authStorage";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await logout(refreshToken);
      }
    },

    onSuccess: async () => {
      await clearSession();

      queryClient.clear();
    },
  });
}

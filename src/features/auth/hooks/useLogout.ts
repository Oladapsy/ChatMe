import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "@/features/auth/api/authApi";
import { clearSession, getRefreshToken } from "@/services/authStorage";
import { useAuthStore } from "@/store/authStore";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log("LOGOUT: starting...");

      const refreshToken = await getRefreshToken();

      console.log("LOGOUT: refresh token exists?", !!refreshToken);

      if (refreshToken) {
        await logout(refreshToken);
        console.log("LOGOUT: backend logout successful");
      }
    },

    onSuccess: async () => {
      console.log("LOGOUT: clearing local session...");

      await clearSession();

      queryClient.clear();

      console.log("LOGOUT: complete");
    },

    onError: (error) => {
      console.log("LOGOUT: failed", error);
    },
  });
}

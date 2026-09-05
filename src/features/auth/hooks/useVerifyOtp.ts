import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "@/features/auth/api/authApi";
import { saveSession } from "@/services/authStorage";
import { useAuthStore } from "@/store/authStore";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,

    onSuccess: async (data) => {
      const now = Date.now();

      await saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,

        accessTokenExpiresAt: now + data.accessTokenExpiresInSeconds * 1000,

        refreshTokenExpiresAt: now + data.refreshTokenExpiresInSeconds * 1000,
      });
      useAuthStore.getState().setAuthenticated(true);
    },
  });
}

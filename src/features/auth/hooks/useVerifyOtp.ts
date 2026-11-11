import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "@/features/auth/api/authApi";
import { getSessionGeneration, saveSession } from "@/services/authStorage";
import { queryClient } from "@/services/queryClient";
import { endSession } from "@/services/sessionLifecycle";
import { useAuthStore } from "@/store/authStore";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: Parameters<typeof verifyOtp>[0]) => {
      const generation = getSessionGeneration();
      const data = await verifyOtp(payload);
      const assertCurrent = (expected: number) => {
        if (expected !== getSessionGeneration()) throw new Error("Login changed. Please request a new code.");
      };
      assertCurrent(generation);
      await endSession(generation);
      assertCurrent(generation + 1);
      const now = Date.now();
      await saveSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: now + data.accessTokenExpiresInSeconds * 1000,
        refreshTokenExpiresAt: now + data.refreshTokenExpiresInSeconds * 1000,
      });
      assertCurrent(generation + 2);
      queryClient.setQueryData(["me"], data.user);
      useAuthStore.setState({ isAuthenticated: true, profileComplete: data.user.profileComplete, avatarUrl: data.user.avatarUrl });
      return data;
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unregisterPushForLogout } from "@/features/notifications/pushDevices";
import { logout } from "@/features/auth/api/authApi";
import { clearSession, getRefreshToken } from "@/services/authStorage";
import { useAuthStore } from "@/store/authStore";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const tokenPromise = getRefreshToken();
      try { await unregisterPushForLogout(); } catch { /* Server logout also invalidates this login family. */ }
      // Invalidate pending refresh work as soon as logout starts.
      await clearSession();
      queryClient.clear();
      useAuthStore.setState({ isAuthenticated: false, profileComplete: false, avatarUrl: null });
      const token = await tokenPromise;
      if (token) { try { await logout(token); } catch { /* Local logout is already complete. */ } }
    },
  });
}

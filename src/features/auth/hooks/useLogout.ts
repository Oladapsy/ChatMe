import { useMutation } from "@tanstack/react-query";
import { unregisterPushForLogout } from "@/features/notifications/pushDevices";
import { getRefreshToken } from "@/services/authStorage";
import { endSession } from "@/services/sessionLifecycle";
import { refreshApi } from "@/services/refreshApi";

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // Capture old credentials and cancel registration before invalidating the session.
      const token = getRefreshToken();
      void unregisterPushForLogout().catch(() => {});
      const cleared = endSession();
      // Revocation uses an isolated client: it must never authenticate as a later login.
      void token.then(async refreshToken => { if (refreshToken) await refreshApi.post("/auth/logout", { refreshToken }); }).catch(() => {});
      await cleared;
    },
  });
}

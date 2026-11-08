import { useEffect, useState } from "react";

import { getRefreshToken, getSessionGeneration } from "@/services/authStorage";
import { getMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/services/queryClient";

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initialize() {
      const generation = getSessionGeneration();
      let hadSession = false;
      try {
        console.log("AUTH INIT: checking session...");

        const refreshToken = await getRefreshToken();

        console.log("AUTH INIT: refresh token exists?", !!refreshToken);

        if (!refreshToken) {
          console.log("AUTH INIT: no refresh token");

          useAuthStore.getState().setAuthenticated(false);
          return;
        }

        hadSession = true;
        console.log("AUTH INIT: calling /me...");

        const user = await getMe();

        console.log("AUTH INIT: /me successful", user);

        if (generation !== getSessionGeneration()) return;
        queryClient.setQueryData(["me"], user);
        
        useAuthStore.getState().setAuthenticated(true);
        useAuthStore.getState().setProfileComplete(user.profileComplete);
        useAuthStore.getState().setAvatarUrl(user.avatarUrl);

        console.log("AUTH INIT: authenticated = true");
      } catch (error) {
        console.log("AUTH INIT: failed", error);

        if (generation === getSessionGeneration()) {
          useAuthStore.getState().setAuthenticated(hadSession);
        }
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, []);

  return {
    isInitializing,
  };
}

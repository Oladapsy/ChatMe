import { useEffect, useState } from "react";

import { getRefreshToken } from "@/services/authStorage";
import { getMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        console.log("AUTH INIT: checking session...");

        const refreshToken = await getRefreshToken();

        console.log("AUTH INIT: refresh token exists?", !!refreshToken);

        if (!refreshToken) {
          console.log("AUTH INIT: no refresh token");

          useAuthStore.getState().setAuthenticated(false);
          return;
        }

        console.log("AUTH INIT: calling /me...");

        const user = await getMe();

        console.log("AUTH INIT: /me successful", user);

        useAuthStore.getState().setAuthenticated(true);

        console.log("AUTH INIT: authenticated = true");
      } catch (error) {
        console.log("AUTH INIT: failed", error);

        useAuthStore.getState().setAuthenticated(false);
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

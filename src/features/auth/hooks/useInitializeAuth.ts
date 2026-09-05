import { useEffect, useState } from "react";
import { getRefreshToken } from "@/services/authStorage";
import { getMe } from "@/features/auth/api/authApi";
// store import
import { useAuthStore } from "@/store/authStore";

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        console.log("AUTH INIT: checking session...");

        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          useAuthStore.getState().setAuthenticated(false);
          return;
        }

        await getMe();
        useAuthStore.getState().setAuthenticated(true);
      } catch {
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

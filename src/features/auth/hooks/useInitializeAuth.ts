import { useEffect, useState } from "react";
import { getRefreshToken } from "@/services/authStorage";
import { getMe } from "@/features/auth/api/authApi";

export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          setIsAuthenticated(false);
          return;
        }

        await getMe();

        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, []);

  return {
    isInitializing,
    isAuthenticated,
  };
}

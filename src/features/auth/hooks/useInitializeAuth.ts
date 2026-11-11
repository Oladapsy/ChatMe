import { useEffect, useState } from "react";
import { getRefreshToken, getSessionGeneration } from "@/services/authStorage";
import { getMe } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/services/queryClient";
export function useInitializeAuth() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    const generation = getSessionGeneration();
    setIsInitializing(true);
    setError(null);
    void (async () => {
      try {
        if (!await getRefreshToken()) return;
        const user = await getMe();
        if (disposed || generation !== getSessionGeneration()) return;
        queryClient.setQueryData(["me"], user);
        useAuthStore.setState({ isAuthenticated: true, profileComplete: user.profileComplete, avatarUrl: user.avatarUrl });
      } catch {
        if (!disposed && generation === getSessionGeneration()) setError("We couldn't restore your profile. Check your connection and try again. Your saved login is still available.");
      } finally { if (!disposed) setIsInitializing(false); }
    })();
    return () => { disposed = true; };
  }, [attempt]);
  return { isInitializing, initializationError, retryInitialization: () => setAttempt(value => value + 1) };
}

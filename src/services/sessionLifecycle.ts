import { clearSession, getSessionGeneration } from "@/services/authStorage";
import { queryClient } from "@/services/queryClient";
import { useAuthStore } from "@/store/authStore";

// Invalidate requests synchronously before clearing any account-owned state.
export function endSession(expected = getSessionGeneration()): Promise<void> {
  if (expected !== getSessionGeneration()) return Promise.resolve();
  const cleared = clearSession();
  void queryClient.cancelQueries();
  queryClient.clear();
  useAuthStore.setState({ isAuthenticated: false, profileComplete: false, avatarUrl: null });
  return cleared;
}

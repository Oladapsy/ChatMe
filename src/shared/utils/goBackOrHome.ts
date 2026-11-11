import type { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export function goBackOrHome(router: Pick<ReturnType<typeof useRouter>, "canGoBack" | "back" | "replace">) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  const { isAuthenticated, profileComplete } = useAuthStore.getState();
  router.replace(!isAuthenticated ? "/" : !profileComplete ? "/(auth)/setup-profile" : "/(tabs)");
}

import { useEffect, useState, useRef } from "react";
import { AppState } from "react-native";
import { useRouter, useRootNavigationState, usePathname, useGlobalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePinStore } from "@/store/pinStore";
import { beginPushSession, loadPushPreference, pushSupported, syncPushRegistration, usePushState } from "./pushDevices";

export function PushNotifications({ authenticated, profileComplete }: { authenticated: boolean; profileComplete: boolean }) {
  const router = useRouter();
  const navigation = useRootNavigationState();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const currentScreen = useRef({ pathname, id: params.id });
  currentScreen.current = { pathname, id: params.id };
  const locked = usePinStore(state => !state.ready || state.locked);
  const [pending, setPending] = useState<string | null>(null);
  useEffect(() => {
    if (!authenticated || !pushSupported) { setPending(null); return; }
    let disposed = false;
    const subscriptions: {remove: () => void}[] = [];
    beginPushSession();
    const sync = () => { void syncPushRegistration(false).catch(() => {}); };
    void (async () => {
      await loadPushPreference();
      if (disposed) return;
      const Notifications = await import("expo-notifications");
      if (disposed) return;
      Notifications.setNotificationHandler({ handleNotification: async notification => {
        const sameChat = currentScreen.current.pathname === "/chat-room" && currentScreen.current.id === notification.request.content.data?.conversationId && AppState.currentState === "active";
        const pinState = usePinStore.getState();
        const show = usePushState.getState().enabled && !sameChat && pinState.ready && !pinState.locked;
        return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
      }});
      const onResponse = (response: import("expo-notifications").NotificationResponse) => {
        const id = response.notification.request.content.data?.conversationId;
        if (typeof id === "string" && id.length > 0) setPending(id);
        void Notifications.clearLastNotificationResponseAsync();
      };
      subscriptions.push(Notifications.addNotificationResponseReceivedListener(onResponse));
      const last = await Notifications.getLastNotificationResponseAsync();
      if (disposed) return;
      if (last) onResponse(last);
      subscriptions.push(Notifications.addNotificationReceivedListener(notification => {
        const id = notification.request.content.data?.conversationId;
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if (typeof id === "string") void queryClient.invalidateQueries({ queryKey: ["messages", id] });
      }));
      subscriptions.push(Notifications.addPushTokenListener(() => sync()));
      subscriptions.push(AppState.addEventListener("change", state => { if (state === "active") sync(); }));
      // Only a deliberate Settings action asks for permission.
      sync();
    })().catch(() => {});
    return () => { disposed = true; subscriptions.forEach(item => item.remove()); };
  }, [authenticated, queryClient]);
  useEffect(() => {
    if (!pending || !authenticated || !profileComplete || locked || !navigation?.key) return;
    router.push({ pathname: "/chat-room", params: { id: pending } });
    setPending(null);
  }, [pending, authenticated, profileComplete, locked, navigation?.key, router]);
  return null;
}

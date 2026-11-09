import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import type { AxiosRequestConfig } from "axios";
import { api } from "@/services/api";
import { getSessionGeneration } from "@/services/authStorage";

const ID_KEY = "chatme.push.installation";
const PREFERENCE_KEY = "chatme.push.enabled";
export const pushSupported = Platform.OS !== "web" && Constants.appOwnership !== "expo";
export const usePushState = create<{ enabled: boolean; registered: boolean; busy: boolean; error: string | null }>(() => ({ enabled: true, registered: false, busy: false, error: null }));
let installation: Promise<string> | undefined;
let revision = 0;
let queue: Promise<unknown> = Promise.resolve();
let loggingOut = false;
function serialized<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work);
  queue = next.catch(() => {});
  return next;
}
export function getInstallationId(): Promise<string> {
  return installation ??= (async () => {
    const saved = await SecureStore.getItemAsync(ID_KEY);
    if (saved) return saved;
    const id = Crypto.randomUUID();
    await SecureStore.setItemAsync(ID_KEY, id);
    return id;
  })().catch(error => { installation = undefined; throw error; });
}
const config = (generation: number): AxiosRequestConfig => ({ _session: generation, timeout: 10000 } as AxiosRequestConfig);
export async function loadPushPreference() {
  const saved = await SecureStore.getItemAsync(PREFERENCE_KEY);
  usePushState.setState({ enabled: saved !== "false" });
}
export function beginPushSession() { loggingOut = false; }
export function syncPushRegistration(requestPermission = false): Promise<void> {
  const generation = getSessionGeneration();
  const currentRevision = revision;
  return serialized(async () => {
    if (loggingOut || generation !== getSessionGeneration() || revision !== currentRevision || !pushSupported) return;
    const state = usePushState.getState();
    if (!state.enabled) return;
    usePushState.setState({ busy: true, error: null });
    try {
      const Notifications = await import("expo-notifications");
      const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) throw new Error("Push notifications need an Expo project ID and a development build.");
      if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("messages", {
        name: "Messages", importance: Notifications.AndroidImportance.HIGH, sound: "default",
      });
      let permission = await Notifications.getPermissionsAsync();
      if (!permission.granted && requestPermission && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) {
        usePushState.setState({ registered: false });
        const id = await getInstallationId();
        if (generation === getSessionGeneration() && !loggingOut) await api.delete(`/me/push-devices/${id}`, config(generation));
        if (requestPermission) throw new Error("Allow notifications in your device Settings to receive message alerts.");
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      const id = await getInstallationId();
      if (loggingOut || revision !== currentRevision || generation !== getSessionGeneration()) return;
      await api.put(`/me/push-devices/${id}`, { platform: Platform.OS, token }, config(generation));
      if (!loggingOut && generation === getSessionGeneration() && revision === currentRevision) usePushState.setState({ registered: true });
    } catch (error) {
      const failure = error as { response?: {status?: number}; message?: string };
      const status = failure.response?.status;
      const message = status === 503 ? "Push notifications are currently disabled on the server." : status === 429 ? "This account has reached its device limit." : failure.message ?? "Notification registration failed.";
      usePushState.setState({ registered: false, error: message });
      throw new Error(message);
    } finally { usePushState.setState({ busy: false }); }
  });
}
export async function setPushEnabled(enabled: boolean) {
  if (!pushSupported && enabled) throw new Error("Use a development build to enable push notifications.");
  revision++;
  await SecureStore.setItemAsync(PREFERENCE_KEY, String(enabled));
  usePushState.setState({ enabled, error: null });
  if (enabled) return syncPushRegistration(true);
  const generation = getSessionGeneration();
  return serialized(async () => {
    usePushState.setState({ busy: true });
    try {
      const id = await getInstallationId();
      if (generation !== getSessionGeneration()) return;
      await api.delete(`/me/push-devices/${id}`, config(generation));
      usePushState.setState({ registered: false });
    } catch {
      await SecureStore.setItemAsync(PREFERENCE_KEY, "true");
      usePushState.setState({ enabled: true });
      throw new Error("Could not unregister this device. Please try turning notifications off again.");
    }
    finally { usePushState.setState({ busy: false }); }
  });
}
export function unregisterPushForLogout(): Promise<void> {
  loggingOut = true;
  revision++;
  const generation = getSessionGeneration();
  usePushState.setState({ registered: false });
  return serialized(async () => {
    if (!pushSupported) return;
    const id = await getInstallationId();
    if (generation === getSessionGeneration()) await api.delete(`/me/push-devices/${id}`, config(generation));
  });
}

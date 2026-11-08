import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSessionIfCurrent, getAccessToken, getSessionGeneration } from "@/services/authStorage";
import { refreshSession } from "@/services/refreshSession";
import { useAuthStore } from "@/store/authStore";

type SessionRequest = InternalAxiosRequestConfig & { _retry?: boolean; _session?: number };
export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_ORIGIN}/v1`,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});
const refreshes = new Map<number, Promise<unknown>>();
api.interceptors.request.use(async (config: SessionRequest) => {
  const generation = config._session ?? getSessionGeneration();
  const token = await getAccessToken();
  if (generation !== getSessionGeneration()) throw new Error("Session changed");
  config._session = generation;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, async (error: AxiosError) => {
  const request = error.config as SessionRequest | undefined;
  if (!request || error.response?.status !== 401 || request._retry) throw error;
  const generation = request._session!;
  if (generation !== getSessionGeneration()) throw error;
  request._retry = true;
  try {
    let pending = refreshes.get(generation);
    if (!pending) {
      pending = refreshSession().finally(() => refreshes.delete(generation));
      refreshes.set(generation, pending);
    }
    await pending;
    if (generation !== getSessionGeneration()) throw new Error("Session changed");
    return api(request);
  } catch (refreshError) {
    // Network errors, rate limits and server outages leave credentials available for retry.
    if (axios.isAxiosError(refreshError) && [400, 401, 403].includes(refreshError.response?.status ?? 0)) {
      if (await clearSessionIfCurrent(generation)) {
        useAuthStore.getState().setAuthenticated(false);
      }
    }
    throw refreshError;
  }
});

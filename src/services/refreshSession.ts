import { endSession } from "@/services/sessionLifecycle";
import { refreshApi } from "@/services/refreshApi";
import {
  getRefreshToken,
  saveSessionIfCurrent,
  getSessionGeneration,
} from "@/services/authStorage";

export type RefreshResponse = {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: {
    id: string;
    phoneNumber: string;
    displayName: string | null;
    avatarUrl: string | null;
    profileComplete: boolean;
    createdAt: string;
  };
};

const pendingRefreshes = new Map<number, Promise<RefreshResponse>>();

export function refreshSession(): Promise<RefreshResponse> {
  const generation = getSessionGeneration();
  const existing = pendingRefreshes.get(generation);
  if (existing) return existing;
  const pending = performRefresh().catch(async error => {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status && [400, 401, 403].includes(status)) await endSession(generation);
    throw error;
  }).finally(() => pendingRefreshes.delete(generation));
  pendingRefreshes.set(generation, pending);
  return pending;
}

async function performRefresh(): Promise<RefreshResponse> {
  const generation = getSessionGeneration();
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await refreshApi.post<RefreshResponse>(
    "/auth/refresh",
    {
      refreshToken,
    },
  );

  const data = response.data;

  const now = Date.now();

  const saved = await saveSessionIfCurrent({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt:
      now + data.accessTokenExpiresInSeconds * 1000,
    refreshTokenExpiresAt:
      now + data.refreshTokenExpiresInSeconds * 1000,
  }, generation);
  if (!saved) throw new Error("Session changed during refresh");

  return data;
}
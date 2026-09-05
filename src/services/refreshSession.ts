import { refreshApi } from "@/services/refreshApi";
import {
  getRefreshToken,
  saveSession,
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

export async function refreshSession(): Promise<RefreshResponse> {
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

  await saveSession({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt:
      now + data.accessTokenExpiresInSeconds * 1000,
    refreshTokenExpiresAt:
      now + data.refreshTokenExpiresInSeconds * 1000,
  });

  return data;
}
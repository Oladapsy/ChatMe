import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "chateo_access_token";
const REFRESH_TOKEN_KEY = "chateo_refresh_token";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export async function saveSession(
  session: AuthSession,
): Promise<void> {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    session.accessToken,
  );

  await SecureStore.setItemAsync(
    REFRESH_TOKEN_KEY,
    session.refreshToken,
  );
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
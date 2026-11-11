import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "chateo_access_token";
const REFRESH_TOKEN_KEY = "chateo_refresh_token";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

// Serialize credential mutations; generation changes immediately on login/logout.
let generation = 0;
let writes: Promise<unknown> = Promise.resolve();
export const getSessionGeneration = () => generation;
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const next = writes.then(operation);
  writes = next.catch(() => {});
  return next;
}
export function saveSessionIfCurrent(session: AuthSession, expected: number): Promise<boolean> {
  return serialize(async () => {
    if (generation !== expected) return false;
    await writeSession(session);
    return generation === expected;
  });
}
async function writeSession(
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

export function saveSession(session: AuthSession): Promise<void> {
  generation++;
  return serialize(() => writeSession(session));
}
export async function getAccessToken(): Promise<string | null> {
  await writes;
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}
export function getRefreshToken(): Promise<string | null> {
  return serialize(() => SecureStore.getItemAsync(REFRESH_TOKEN_KEY));
}
export function clearSessionIfCurrent(expected: number): Promise<boolean> {
  if (generation !== expected) return Promise.resolve(false);
  return clearSession().then(() => generation === expected + 1);
}
export function clearSession(): Promise<void> {
  generation++;
  return serialize(async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  });
}

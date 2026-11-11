import type { Socket } from "socket.io-client";
import { getSessionGeneration } from "@/services/authStorage";
import { refreshSession } from "@/services/refreshSession";

type ConnectionError = Error & { data?: { code?: string; error?: { code?: string } } };
function needsRefresh(error: ConnectionError) {
  const code = error.data?.code ?? error.data?.error?.code;
  return code === "AUTH_ACCESS_TOKEN_INVALID" || code === "AUTH_ACCESS_TOKEN_EXPIRED" ||
    /^(A valid access token is required\.?|jwt expired|invalid token)$/i.test(error.message);
}

// Namespace authentication errors do not always trigger Socket.IO's transport retries.
export function installSocketRecovery(socket: Socket, isActive: () => boolean, setStatus: (status: string) => void = () => {}) {
  const generation = getSessionGeneration();
  let disposed = false;
  let refreshing = false;
  let refreshed = false;
  let retryDelay = 1000;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const current = () => !disposed && generation === getSessionGeneration();
  const clearRetry = () => { if (timer) clearTimeout(timer); timer = undefined; };
  const schedule = (work: () => void) => {
    clearRetry();
    if (!current() || !isActive()) return;
    timer = setTimeout(() => { timer = undefined; if (current() && isActive()) work(); }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30000);
  };
  const refresh = () => {
    if (!current() || !isActive() || refreshing) return;
    // Do not repeatedly rotate credentials if a fresh token is also rejected.
    if (refreshed) { setStatus("Chat authentication unavailable. Reopen this chat to retry."); return; }
    refreshing = true;
    setStatus("Reconnecting…");
    void refreshSession().then(() => {
      if (!current() || !isActive()) return;
      refreshed = true;
      socket.connect();
    }).catch(() => {
      if (!current()) return;
      setStatus("Connection unavailable. Retrying…");
      schedule(refresh);
    }).finally(() => { refreshing = false; });
  };
  const onError = (error: ConnectionError) => {
    if (!current()) return;
    clearRetry();
    if (needsRefresh(error)) { refresh(); return; }
    setStatus("Connection unavailable. Retrying…");
    schedule(() => socket.connect());
  };
  const onConnect = () => { clearRetry(); retryDelay = 1000; refreshed = false; setStatus("Connected"); };
  const onDisconnect = (reason: string) => {
    if (!current()) return;
    setStatus("Reconnecting…");
    if (reason === "io server disconnect") refresh();
  };
  socket.on("connect_error", onError);
  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  return {
    start: () => { if (current()) { clearRetry(); refreshed = false; socket.connect(); } },
    stop: () => { clearRetry(); socket.disconnect(); },
    dispose: () => { disposed = true; clearRetry(); socket.off("connect_error", onError); socket.off("connect", onConnect); socket.off("disconnect", onDisconnect); },
  };
}

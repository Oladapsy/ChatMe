import { useEffect } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { createChatSocket } from "@/features/chats/services/chatSocket";
import { getSessionGeneration } from "@/services/authStorage";
import { refreshSession } from "@/services/refreshSession";
export function ConversationRealtime({ authenticated }: { authenticated: boolean }) {
  const client = useQueryClient();
  useEffect(() => {
    if (!authenticated) return;
    const generation = getSessionGeneration();
    let disposed = false;
    const socket = createChatSocket();
    const refresh = () => {
      if (disposed || generation !== getSessionGeneration()) return;
      for (const key of ["conversations", "favorites", "archived-conversations", "conversation"]) void client.invalidateQueries({ queryKey: [key] });
    };
    socket.on("connect", refresh);
    socket.onAny((event: string) => { if (/^(message|reaction|receipt|conversation)\./.test(event)) refresh(); });
    socket.on("connect_error", (error: Error & { data?: { code?: string } }) => {
      if (error.data?.code === "AUTH_ACCESS_TOKEN_INVALID") void refreshSession().then(() => {
        if (!disposed && generation === getSessionGeneration()) socket.connect();
      }).catch(() => {});
    });
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") { socket.connect(); refresh(); }
      else socket.disconnect();
    });
    socket.connect();
    return () => { disposed = true; subscription.remove(); socket.offAny(); socket.removeAllListeners(); socket.disconnect(); };
  }, [authenticated, client]);
  return null;
}

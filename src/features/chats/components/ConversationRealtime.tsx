import { installListTyping } from "@/features/chats/services/listTyping";
import { useEffect } from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { createChatSocket } from "@/features/chats/services/chatSocket";
import { getSessionGeneration } from "@/services/authStorage";
import { installSocketRecovery } from "@/features/chats/services/socketRecovery";
export function ConversationRealtime({ authenticated }: { authenticated: boolean }) {
  const client = useQueryClient();
  useEffect(() => {
    if (!authenticated) return;
    const generation = getSessionGeneration();
    let disposed = false;
    const socket = createChatSocket();
    const user = client.getQueryData<{ id: string }>(["me"]);
    const stopTyping = installListTyping(socket, client, user?.id ?? "", () => !disposed && generation === getSessionGeneration());
    const refresh = () => {
      if (disposed || generation !== getSessionGeneration()) return;
      for (const key of ["conversations", "favorites", "archived-conversations", "conversation", "receipts"]) void client.invalidateQueries({ queryKey: [key] });
    };
    socket.on("connect", refresh);
    socket.onAny((event: string) => { if (/^(message|reaction|receipt|conversation)\./.test(event)) refresh(); });
    const connection = installSocketRecovery(socket, () => AppState.currentState === "active");
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") { connection.start(); refresh(); }
      else connection.stop();
    });
    connection.start();
    return () => { stopTyping(); disposed = true; connection.dispose(); subscription.remove(); socket.offAny(); socket.removeAllListeners(); socket.disconnect(); };
  }, [authenticated, client]);
  return null;
}

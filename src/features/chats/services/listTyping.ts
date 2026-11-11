import type { Socket } from "socket.io-client";
import type { QueryClient } from "@tanstack/react-query";

type TypingEvent = { conversationId: string; userId: string; expiresAt: string };
export function installListTyping(socket: Socket, client: QueryClient, ownUserId: string, isCurrent: () => boolean) {
  let disposed = false;
  let epoch = 0;
  const subscribed = new Set<string>();
  const revisions = new Map<string, number>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  const key = (conversationId: string, userId: string) => JSON.stringify([conversationId, userId]);
  const active = () => !disposed && isCurrent();
  const stop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
    if (!active()) return;
    clearTimeout(timers.get(key(conversationId, userId)));
    timers.delete(key(conversationId, userId));
    client.setQueryData<string[]>(["typing", conversationId], current => current?.filter(id => id !== userId) ?? []);
  };
  const start = (event: TypingEvent) => {
    if (!active() || !subscribed.has(event.conversationId) || event.userId === ownUserId) return;
    const delay = Date.parse(event.expiresAt) - Date.now();
    if (!Number.isFinite(delay) || delay <= 0) return;
    clearTimeout(timers.get(key(event.conversationId, event.userId)));
    timers.set(key(event.conversationId, event.userId), setTimeout(() => stop(event), Math.min(delay, 10000)));
    client.setQueryData<string[]>(["typing", event.conversationId], current => current?.includes(event.userId) ? current : [...(current ?? []), event.userId]);
  };
  const clearConversation = (id: string) => {
    for (const userId of client.getQueryData<string[]>(["typing", id]) ?? []) stop({ conversationId: id, userId });
  };
  const sync = () => {
    if (!active() || !socket.connected) return;
    const visible = new Set(client.getQueryCache().findAll({ queryKey: ["typing"] })
      .filter(query => query.getObserversCount() > 0 && typeof query.queryKey[1] === "string")
      .map(query => query.queryKey[1] as string));
    for (const id of subscribed) if (!visible.has(id)) {
      subscribed.delete(id);
      clearConversation(id);
      socket.emit("presence.unsubscribe", { conversationId: id }, () => {});
    }
    for (const id of visible) if (!subscribed.has(id)) {
      subscribed.add(id);
      const connectionEpoch = epoch;
      const revision = revisions.get(id) ?? 0;
      socket.emit("presence.subscribe", { conversationId: id }, (ack: { ok: boolean; data?: { typing?: Omit<TypingEvent, "conversationId">[] } }) => {
        if (!active() || connectionEpoch !== epoch || !subscribed.has(id) || revision !== (revisions.get(id) ?? 0) || !ack?.ok) return;
        ack.data?.typing?.forEach(event => start({ ...event, conversationId: id }));
      });
    }
  };
  const live = (event: TypingEvent, typing: boolean) => {
    if (!active() || !subscribed.has(event.conversationId)) return;
    revisions.set(event.conversationId, (revisions.get(event.conversationId) ?? 0) + 1);
    if (typing) start(event); else stop(event);
  };
  const started = (event: TypingEvent) => live(event, true);
  const stopped = (event: TypingEvent) => live(event, false);
  const created = (event: { conversationId: string; senderId: string } | { message: { conversationId: string; senderId: string } }) => {
    const message = "message" in event ? event.message : event;
    live({ conversationId: message.conversationId, userId: message.senderId, expiresAt: "" }, false);
  };
  const reset = () => {
    epoch++;
    for (const id of subscribed) clearConversation(id);
    timers.forEach(clearTimeout);
    timers.clear(); subscribed.clear(); revisions.clear();
  };
  const connected = () => { reset(); sync(); };
  socket.on("connect", connected);
  socket.on("disconnect", reset);
  socket.on("typing.started", started);
  socket.on("typing.stopped", stopped);
  socket.on("message.created", created);
  const unsubscribe = client.getQueryCache().subscribe(event => {
    if (event.type === "observerAdded" || event.type === "observerRemoved") sync();
  });
  sync();
  return () => {
    reset(); disposed = true; unsubscribe();
    socket.off("connect", connected); socket.off("disconnect", reset);
    socket.off("typing.started", started); socket.off("typing.stopped", stopped); socket.off("message.created", created);
  };
}

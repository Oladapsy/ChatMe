
import { useEffect, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import { refreshSession } from "@/services/refreshSession";
import { getMessages } from "@/features/chats/api/chatApi";
import { recoverMessages } from "@/features/chats/utils/recoverMessages";
import {
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { createChatSocket } from "@/features/chats/services/chatSocket";
import type {
  Message,
  MessageHistoryResponse,
} from "@/features/chats/types/message";

type MessageCreatedEvent = Message | { message: Message };

function extractMessage(event: MessageCreatedEvent): Message {
  const message = "message" in event ? event.message : event;
  return { ...message, attachments: message.attachments ?? [], reactions: message.reactions ?? [], replyToMessageId: message.replyToMessageId ?? null, editedAt: message.editedAt ?? null, deletedAt: message.deletedAt ?? null, version: message.version ?? 1 };
}

export function useChatSocket(conversationId: string, userId?: string) {
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [participants, setParticipants] = useState<Record<string, string>>({});
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const localTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastStart = useRef(0);
  const setTyping = useCallback((typing: boolean) => {
    if (localTimer.current) clearTimeout(localTimer.current);
    const socket = socketRef.current;
    if (!socket?.connected) return;
    if (!typing) {
      lastStart.current = 0;
      socket.volatile.emit("typing.stop", { conversationId }, () => undefined);
      return;
    }
    if (!lastStart.current || Date.now() - lastStart.current >= 3000) {
      socket.volatile.emit("typing.start", { conversationId }, () => undefined);
      lastStart.current = Date.now();
    }
    localTimer.current = setTimeout(() => {
      socket.volatile.emit("typing.stop", { conversationId }, () => undefined);
      lastStart.current = 0;
    }, 2000);
  }, [conversationId]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const socket = createChatSocket();
    socketRef.current = socket;
    setParticipants({});
    setTypingUsers([]);
    setStatus("Connecting…");
    const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
    const stopRemoteTyping = (id: string) => {
      clearTimeout(typingTimers.get(id));
      typingTimers.delete(id);
      setTypingUsers(current => current.filter(item => item !== id));
    };
    const startRemoteTyping = (event: { conversationId: string; userId: string; expiresAt: string }) => {
      if (event.conversationId !== conversationId || event.userId === userId) return;
      const delay = Date.parse(event.expiresAt) - Date.now();
      if (!Number.isFinite(delay) || delay <= 0) return;
      clearTimeout(typingTimers.get(event.userId));
      setTypingUsers(current => current.includes(event.userId) ? current : [...current, event.userId]);
      typingTimers.set(event.userId, setTimeout(() => stopRemoteTyping(event.userId), delay));
    };

    let disposed = false;
    let recovering = false;
    let recoveryRequested = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const recover = async () => {
      recoveryRequested = true;
      if (recovering) return;
      recovering = true;
      try {
        while (recoveryRequested && !disposed) {
          recoveryRequested = false;
          const key = ["messages", conversationId];
          const current = queryClient.getQueryData<InfiniteData<MessageHistoryResponse>>(key);
          const known = new Set(current?.pages.flatMap(page => page.items.map(item => item.id)) ?? []);
          const missed = await recoverMessages(known, cursor => getMessages(conversationId, { cursor, limit: 50 }));
          if (disposed) return;
          queryClient.setQueryData<InfiniteData<MessageHistoryResponse>>(key, latest => {
            if (!latest) return latest;
            const updates = new Map(missed.map(message => [message.id, message]));
            const existing = new Set(latest.pages.flatMap(page => page.items.map(message => message.id)));
            return { ...latest, pages: latest.pages.map((page, index) => ({
              ...page,
              items: [...(index === 0 ? missed.filter(message => !existing.has(message.id)) : []), ...page.items.map(message => updates.get(message.id) ?? message)],
            })) };
          });
          void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      } catch {
        // A connected socket can coexist with an unavailable history endpoint.
        if (!disposed) retryTimer = setTimeout(() => void recover(), 5000);
      } finally {
        recovering = false;
      }
    };
    const handleConnect = () => {
      setStatus("Connected");
      socket.emit("presence.subscribe", { conversationId }, (ack: { ok: boolean; data?: { participants: { userId: string; status: string }[]; typing: { userId: string; expiresAt: string }[] } }) => {
        if (disposed || !ack.ok || !ack.data) return;
        setParticipants(Object.fromEntries(ack.data.participants.map(item => [item.userId, item.status])));
        ack.data.typing.forEach(item => startRemoteTyping({ ...item, conversationId }));
      });
      void recover();
      void queryClient.invalidateQueries({ queryKey: ["receipts", conversationId] });
    };
    const handleDisconnect = () => {
      setStatus("Reconnecting…");
      setParticipants({});
      setTypingUsers([]);
      typingTimers.forEach(clearTimeout);
      typingTimers.clear();
      lastStart.current = 0;
    };
    const appState = AppState.addEventListener("change", state => {
      if (state === "active") {
        if (!socket.connected) socket.connect();
        else handleConnect();
      } else {
        setTyping(false);
        socket.disconnect();
      }
    });

    let refreshingAuth = false;
    const reconnectWithFreshToken = () => {
      if (refreshingAuth || disposed) return;
      refreshingAuth = true;
      void refreshSession().then(() => {
        if (!disposed && AppState.currentState === "active") socket.connect();
      }).catch(() => {
        if (!disposed) setStatus("Connection unavailable");
      }).finally(() => { refreshingAuth = false; });
    };
    const handleConnectError = (error: Error & { data?: { code?: string } }) => {
      if (error.data?.code === "AUTH_ACCESS_TOKEN_INVALID") reconnectWithFreshToken();
      setStatus("Connection unavailable");
      console.error("SOCKET: connection failed", error.message);
    };

    const handleMessageCreated = (event: MessageCreatedEvent) => {
      const incomingMessage = extractMessage(event);

      if (!incomingMessage?.conversationId) return;
      stopRemoteTyping(incomingMessage.senderId);

      queryClient.setQueryData<
        InfiniteData<MessageHistoryResponse>
      >(
        ["messages", incomingMessage.conversationId],
        (current) => {
          // If history has not loaded, let the normal query fetch it.
          if (!current || current.pages.length === 0) {
            return current;
          }

          // Check every cached page to prevent duplicate messages.
          const alreadyExists = current.pages.some((page) =>
            page.items.some(
              (message) =>
                message.id === incomingMessage.id ||
                (message.senderId === incomingMessage.senderId && message.clientMessageId &&
                  message.clientMessageId ===
                    incomingMessage.clientMessageId),
            ),
          );

          if (alreadyExists) return { ...current, pages: current.pages.map(page => ({ ...page, items: page.items.map(message => message.id === incomingMessage.id || (message.senderId === incomingMessage.senderId && message.clientMessageId === incomingMessage.clientMessageId) ? { ...message, ...incomingMessage } : message) })) };

          // Add the newest message to the first page.
          return {
            ...current,
            pages: current.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    items: [incomingMessage, ...page.items],
                  }
                : page,
            ),
          };
        },
      );

      // Refresh conversation previews and unread counts.
      void queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    };

    socket.on("disconnect", (reason: string) => {
      handleDisconnect();
      if (reason === "io server disconnect") reconnectWithFreshToken();
    });
    socket.on("presence.changed", (event: { conversationId: string; userId: string; status: string }) => {
      if (event.conversationId === conversationId) setParticipants(current => ({ ...current, [event.userId]: event.status }));
    });
    socket.on("typing.started", startRemoteTyping);
    socket.on("typing.stopped", (event: { conversationId: string; userId: string }) => {
      if (event.conversationId === conversationId) stopRemoteTyping(event.userId);
    });
    const refreshReceipts = (event: { conversationId: string }) => {
      void queryClient.invalidateQueries({ queryKey: ["receipts", event.conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    socket.on("receipt.delivered", refreshReceipts);
    socket.on("receipt.read", refreshReceipts);
    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message.created", handleMessageCreated);

    socket.connect();

    return () => {
      disposed = true;
      setTyping(false);
      if (localTimer.current) clearTimeout(localTimer.current);
      typingTimers.forEach(clearTimeout);
      if (socket.connected) socket.emit("presence.unsubscribe", { conversationId }, () => undefined);
      socketRef.current = null;
      if (retryTimer) clearTimeout(retryTimer);
      appState.remove();
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message.created", handleMessageCreated);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [conversationId, queryClient, userId, setTyping]);
  return { status, participants, typingUsers, setTyping };
}

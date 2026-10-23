import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createChatSocket } from "@/features/chats/services/chatSocket";
import type {
  Message,
  MessageHistoryResponse,
} from "@/features/chats/types/message";

type MessageCreatedEvent = Message | { message: Message };

function extractMessage(event: MessageCreatedEvent): Message {
  return "message" in event ? event.message : event;
}

export function useChatSocket(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const socket = createChatSocket();

    const handleConnect = () => {
      console.log("SOCKET: connected", socket.id);
    };

    const handleConnectError = (error: Error) => {
      console.error("SOCKET: connection failed", error.message);
    };

    const handleMessageCreated = (event: MessageCreatedEvent) => {
      const incomingMessage = extractMessage(event);

      if (!incomingMessage?.conversationId) return;

      // Only merge messages into the cache for their own conversation.
      queryClient.setQueryData<MessageHistoryResponse>(
        ["messages", incomingMessage.conversationId],
        (current) => {
          // If history has not loaded, let the normal query fetch it.
          if (!current) return current;

          const alreadyExists = current.items.some(
            (message) =>
              message.id === incomingMessage.id ||
              (message.clientMessageId &&
                message.clientMessageId === incomingMessage.clientMessageId),
          );

          if (alreadyExists) return current;

          // History is displayed reversed in ChatRoomScreen, so keep the
          // newest message at the beginning of the API cache.
          return {
            ...current,
            items: [incomingMessage, ...current.items],
          };
        },
      );

      // Refresh conversation previews and unread counts, if cached.
      void queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message.created", handleMessageCreated);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message.created", handleMessageCreated);
      socket.disconnect();
    };
  }, [conversationId, queryClient]);
}

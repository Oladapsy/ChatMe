
import { useEffect } from "react";
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
                (message.clientMessageId &&
                  message.clientMessageId ===
                    incomingMessage.clientMessageId),
            ),
          );

          if (alreadyExists) return current;

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

import type { InfiniteData } from "@tanstack/react-query";

import type {
  Message,
  MessageHistoryResponse,
} from "@/features/chats/types/message";

export type MessagesCache = InfiniteData<
  MessageHistoryResponse,
  string | undefined
>;

export const updateCachedMessage = (
  oldData: MessagesCache | undefined,
  messageId: string,
  updater: (message: Message) => Message,
): MessagesCache | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      items: page.items.map((message) =>
        message.id === messageId ? updater(message) : message,
      ),
    })),
  };
};

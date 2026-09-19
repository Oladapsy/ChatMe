import type { Message } from "@/features/chats/types/message";
import { formatMessageDate } from "@/features/chats/utils/messageDate";

export type ProcessedMessage =
  | {
      type: "date";
      id: string;
      label: string;
    }
  | (Message & {
      type: "message";
    });

export function processMessages(
  messages: Message[],
  currentUserId?: string,
): ProcessedMessage[] {
  return messages.flatMap((message, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const isNewDate =
      !previousMessage ||
      new Date(previousMessage.createdAt).toDateString() !==
        new Date(message.createdAt).toDateString();

    const isLastFromSender =
      !nextMessage || nextMessage.senderId !== message.senderId;

    const items: ProcessedMessage[] = [];

    if (isNewDate) {
      items.push({
        type: "date",
        id: `date-${message.createdAt}`,
        label: formatMessageDate(message.createdAt),
      });
    }

    items.push({
      type: "message",
      ...message,
      isMe: message.senderId === currentUserId,
      showAvatar: isLastFromSender,
    });

    return items;
  });
}

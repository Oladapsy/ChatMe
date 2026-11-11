import type { LatestMessage } from "@/features/chats/types/chat";
import type { ReceiptFrontier } from "@/features/chats/types/message";

export function latestMessageReceipt(message: LatestMessage | null | undefined, userId: string | undefined, frontiers: ReceiptFrontier[] = [], recipientIds?: string[]): "sent" | "delivered" | "read" | null {
  if (!message || !userId || message.senderId !== userId) return null;
  const recipients = recipientIds
    ? recipientIds.filter(id => id !== userId).map(id => frontiers.find(frontier => frontier.userId === id))
    : frontiers.filter(frontier => frontier.userId !== userId);
  // The list contains only the latest ID. Receipt timestamps are acknowledgement
  // times, so they cannot be used to infer message ordering.
  if (recipients.length && recipients.every(frontier => frontier?.read?.messageId === message.id)) return "read";
  if (recipients.length && recipients.every(frontier => frontier?.delivered?.messageId === message.id || frontier?.read?.messageId === message.id)) return "delivered";
  return "sent";
}

import type { Message } from "@/features/chats/types/message";
export function mergePendingMessages(server: Message[], pending: Message[]): Message[] {
  return [...server, ...pending.filter(local => !server.some(message => message.id === local.id || (message.senderId === local.senderId && !!message.clientMessageId && message.clientMessageId === local.clientMessageId)))];
}

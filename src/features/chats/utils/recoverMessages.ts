import type { Message, MessageHistoryResponse } from "@/features/chats/types/message";

// Walk backwards to a known server message, even when the gap exceeds one page.
export async function recoverMessages(
  knownIds: Set<string>,
  fetchPage: (cursor?: string) => Promise<MessageHistoryResponse>,
): Promise<Message[]> {
  const recovered = new Map<string, Message>();
  let cursor: string | undefined;
  const cursors = new Set<string>();
  do {
    const page = await fetchPage(cursor);
    for (const message of page.items) recovered.set(message.id, message);
    if (page.items.some(message => knownIds.has(message.id)) || !page.pageInfo.hasNextPage) break;
    cursor = page.pageInfo.nextCursor ?? undefined;
    if (!cursor || cursors.has(cursor)) break;
    cursors.add(cursor);
  } while (true);
  return [...recovered.values()];
}

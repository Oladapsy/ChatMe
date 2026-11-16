import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Message, MessageHistoryResponse } from "@/features/chats/types/message";

export const messageSearchKey = (conversationId: string) => ["messages", "search", conversationId] as const;

function matches(message: Message, query: string) {
  return !message.deletedAt && !!message.text?.toLowerCase().includes(query.trim().toLowerCase());
}

export function reconcileSearchItems(items: Message[], history: Message[], query: string): Message[] {
  const latest = new Map(mergeSearchWithHistory(history, [], query).map(message => [message.id, message]));
  return items.flatMap(message => {
    const known = latest.get(message.id);
    const authoritative = known && known.version >= message.version ? known : message;
    return matches(authoritative, query) ? [authoritative] : [];
  });
}

// History wins ties; stale search pages cannot resurrect edited/deleted content.
export function mergeSearchWithHistory(history: Message[], search: Message[], query: string): Message[] {
  const merged = new Map<string, Message>();
  for (const message of history) {
    const existing = merged.get(message.id);
    if (!existing || message.version >= existing.version) merged.set(message.id, message);
  }
  for (const message of search) {
    const existing = merged.get(message.id);
    if (existing ? message.version > existing.version : matches(message, query)) merged.set(message.id, message);
  }
  return [...merged.values()];
}

// completeHistory is used only after walking every history page. Partial mutation
// responses update matching IDs without removing unrelated search results.
export function reconcileMessageSearch(
  client: QueryClient,
  conversationId: string,
  authoritative: Message[],
  completeHistory = false,
) {
  const updates = new Map(authoritative.map(message => [message.id, message]));
  for (const [key] of client.getQueriesData({ queryKey: messageSearchKey(conversationId) })) {
    const query = String(key[3] ?? "");
    client.setQueryData<InfiniteData<MessageHistoryResponse>>(key, current => current && ({
      ...current,
      pages: current.pages.map(page => ({
        ...page,
        items: page.items.flatMap(message => {
          const update = updates.get(message.id);
          if (!update && completeHistory) return [];
          const latest = update && update.version >= message.version ? update : message;
          return matches(latest, query) ? [latest] : [];
        }),
      })),
    }));
  }
  void client.invalidateQueries({ queryKey: messageSearchKey(conversationId) });
}

export function applyMessageUpdate(client: QueryClient, conversationId: string, message: Message) {
  client.setQueryData<InfiniteData<MessageHistoryResponse>>(["messages", conversationId], current => {
    if (!current) return current;
    const exists = current.pages.some(page => page.items.some(existing => existing.id === message.id));
    return {
      ...current,
      pages: current.pages.map((page, index) => ({ ...page, items: [
        ...(!exists && index === 0 ? [message] : []),
        ...page.items.map(existing => existing.id === message.id && message.version >= existing.version ? message : existing),
      ] })),
    };
  });
  reconcileMessageSearch(client, conversationId, [message]);
}

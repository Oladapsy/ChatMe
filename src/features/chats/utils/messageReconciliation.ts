import type { InfiniteData } from "@tanstack/react-query";
import type { Message, MessageHistoryResponse } from "@/features/chats/types/message";

export function newestMessage(current: Message, incoming: Message): Message {
  return (incoming.version ?? 0) >= (current.version ?? 0) ? incoming : current;
}

function identities(message: Message): string[] {
  const keys = [JSON.stringify(["id", message.conversationId, message.id])];
  if (message.senderId && message.clientMessageId) {
    keys.push(JSON.stringify(["client", message.conversationId, message.senderId, message.clientMessageId]));
  }
  return keys;
}

export function sameMessage(a: Message, b: Message): boolean {
  return identities(a).some(key => identities(b).includes(key));
}

// Preserve page metadata and the first cached position while deduplicating both
// server IDs and sender/client IDs. A replay can never downgrade any alias.
export function reconcileMessageHistory(
  current: InfiniteData<MessageHistoryResponse> | undefined,
  incoming: Message[],
  removed = new Map<string, number>(),
): InfiniteData<MessageHistoryResponse> | undefined {
  if (!current?.pages.length) return current;
  type Group = { message: Message; page: number; order: number; fresh: boolean; keys: Set<string> };
  const groups = new Set<Group>();
  const byKey = new Map<string, Group>();
  let order = 0;
  const add = (message: Message, page: number, fresh: boolean) => {
    const keys = identities(message);
    const matches = [...new Set(keys.map(key => byKey.get(key)).filter((item): item is Group => !!item))];
    let group = matches[0];
    if (!group) {
      group = { message, page, order: order++, fresh, keys: new Set() };
      groups.add(group);
    }
    for (const duplicate of matches.slice(1)) {
      group.message = newestMessage(group.message, duplicate.message);
      if (duplicate.order < group.order) {
        group.page = duplicate.page;
        group.order = duplicate.order;
      }
      group.fresh = group.fresh && duplicate.fresh;
      for (const key of duplicate.keys) { group.keys.add(key); byKey.set(key, group); }
      groups.delete(duplicate);
    }
    group.message = newestMessage(group.message, message);
    for (const key of keys) { group.keys.add(key); byKey.set(key, group); }
  };
  current.pages.forEach((page, index) => page.items.forEach(message => {
    const removedVersion = removed.get(message.id);
    if (removedVersion === undefined || message.version > removedVersion) add(message, index, false);
  }));
  incoming.forEach(message => add(message, 0, true));
  const sorted = [...groups].sort((a, b) => Number(b.fresh) - Number(a.fresh) || a.order - b.order);
  return { ...current, pages: current.pages.map((page, index) => ({
    ...page, items: sorted.filter(group => group.page === index).map(group => group.message),
  })) };
}

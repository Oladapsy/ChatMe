import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Message, MessageHistoryResponse } from "@/features/chats/types/message";

type History = InfiniteData<MessageHistoryResponse>;

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

function indexHistory(history: History | undefined) {
  const index = new Map<string, Message>();
  for (const page of history?.pages ?? []) {
    for (const message of page.items) {
      for (const key of identities(message)) {
        const previous = index.get(key);
        index.set(key, previous ? newestMessage(previous, message) : message);
      }
    }
  }
  return index;
}

function findMessage(index: Map<string, Message>, message: Message) {
  return identities(message).reduce<Message | undefined>((match, key) => {
    const candidate = index.get(key);
    return match && candidate ? newestMessage(match, candidate) : match ?? candidate;
  }, undefined);
}

export function reconcileFetchedMessageHistory(
  fetched: History,
  before: History | undefined,
  latest: History | undefined,
  fetchingNext: boolean,
): History {
  // Loading an older page carries forward pages captured by TanStack at fetch
  // start. Take those pages from the live cache and append only the new page.
  if (fetchingNext && before?.pages.length && latest) {
    const appended = fetched.pages.slice(before.pages.length);
    fetched = {
      pages: [...latest.pages, ...appended],
      pageParams: [...latest.pageParams, ...fetched.pageParams.slice(before.pages.length)],
    };
  }

  const latestIndex = indexHistory(latest);
  const beforeIndex = before === latest ? latestIndex : indexHistory(before);
  const pages = fetched.pages.map(page => ({
    ...page,
    items: page.items.flatMap(message => {
      const current = findMessage(latestIndex, message);
      if (current) return [newestMessage(current, message)];
      // Recovery removed this identity while the fetch was in flight.
      return findMessage(beforeIndex, message) ? [] : [message];
    }),
  }));

  if (latest && latest !== before) {
    const fetchedIndex = indexHistory(fetched);
    latest.pages.forEach((page, index) => {
      const retained = page.items.filter(message => {
        if (findMessage(fetchedIndex, message)) return false;
        const previous = findMessage(beforeIndex, message);
        return !previous || (message.version ?? 0) > (previous.version ?? 0);
      });
      const matchingPage = fetched.pageParams.indexOf(latest.pageParams[index]);
      const target = pages[matchingPage < 0 ? 0 : matchingPage];
      if (target) target.items = [...retained, ...target.items];
    });
  }

  return reconcileMessageHistory({ ...fetched, pages }, []) ?? fetched;
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

export function updateCachedMessageHistory(
  client: QueryClient,
  conversationId: string,
  messages: Message[],
  removed?: Map<string, number>,
) {
  const queryKey = ["messages", conversationId];
  client.setQueryData<History>(queryKey, current => {
    // The first history response can also race a socket update.
    if (!current && messages.length && client.isFetching({ queryKey, exact: true })) {
      current = { pages: [{ items: [], pageInfo: { hasNextPage: false, nextCursor: null } }], pageParams: [undefined] };
    }
    return reconcileMessageHistory(current, messages, removed);
  });
}

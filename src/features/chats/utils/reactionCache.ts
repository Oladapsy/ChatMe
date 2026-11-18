import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type {
  Message,
  MessageHistoryResponse,
  MessageReaction,
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

type ReactionLayer = { reaction?: MessageReaction };
type ReactionStack = {
  generation: number;
  version: number;
  base?: MessageReaction;
  layers: ReactionLayer[];
};
type ReactionPatch = {
  key: string;
  messageId: string;
  userId: string;
  stack: ReactionStack;
  layer: ReactionLayer;
};
const optimisticReactions = new WeakMap<QueryClient, Map<string, ReactionStack>>();
const sameReaction = (a?: MessageReaction, b?: MessageReaction) => a?.emoji === b?.emoji;

export function beginReactionPatch(
  client: QueryClient, conversationId: string, messageId: string,
  userId: string, generation: number, emoji?: string,
): ReactionPatch | undefined {
  const queryKey = ["messages", conversationId];
  const message = client.getQueryData<MessagesCache>(queryKey)?.pages.flatMap(page => page.items)
    .filter(item => item.id === messageId).sort((a, b) => b.version - a.version)[0];
  if (!message || message.deletedAt) return;
  let stacks = optimisticReactions.get(client);
  if (!stacks) optimisticReactions.set(client, stacks = new Map());
  const key = JSON.stringify([conversationId, messageId, userId]);
  const current = message.reactions.find(reaction => reaction.userId === userId);
  let stack = stacks.get(key);
  if (!stack || stack.generation !== generation || stack.version !== message.version ||
    !sameReaction(current, stack.layers[stack.layers.length - 1]?.reaction)) {
    stack = { generation, version: message.version, base: current, layers: [] };
    stacks.set(key, stack);
  }
  const layer = { reaction: emoji ? { userId, emoji } : undefined };
  stack.layers.push(layer);
  client.setQueryData<MessagesCache>(queryKey, data => updateCachedMessage(data, messageId, item => item.deletedAt || item.version !== stack.version ? item : ({
    ...item,
    reactions: [...item.reactions.filter(reaction => reaction.userId !== userId), ...(layer.reaction ? [layer.reaction] : [])],
  })));
  return { key, messageId, userId, stack, layer };
}

export function rollbackReactionPatch(client: QueryClient, conversationId: string, patch?: ReactionPatch) {
  if (!patch) return;
  const stacks = optimisticReactions.get(client);
  if (stacks?.get(patch.key) !== patch.stack) return;
  const { stack, layer, messageId, userId } = patch;
  const wasLatest = stack.layers[stack.layers.length - 1] === layer;
  stack.layers = stack.layers.filter(item => item !== layer);
  if (wasLatest) {
    const previous = stack.layers.length ? stack.layers[stack.layers.length - 1].reaction : stack.base;
    client.setQueryData<MessagesCache>(["messages", conversationId], data => updateCachedMessage(data, messageId, message => {
      // A confirmed edit/deletion/reaction has ownership over the newer version.
      // Never restore message text, pagination, or a whole historical snapshot.
      if (message.deletedAt || message.version !== stack.version ||
        !sameReaction(message.reactions.find(item => item.userId === userId), layer.reaction)) return message;
      return { ...message, reactions: [
        ...message.reactions.filter(item => item.userId !== userId), ...(previous ? [previous] : []),
      ] };
    }));
  }
  if (!stack.layers.length) stacks.delete(patch.key);
}

export function confirmReactionPatch(client: QueryClient, conversationId: string, patch?: ReactionPatch) {
  // Retire only this overlay before applying its authoritative response. Another
  // operation may still own a newer layer, even if this response is stale.
  rollbackReactionPatch(client, conversationId, patch);
}

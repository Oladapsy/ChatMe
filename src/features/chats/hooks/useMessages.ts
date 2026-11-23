import { replaceEqualDeep, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { getMessages } from "@/features/chats/api/chatApi";
import type { MessageHistoryResponse } from "@/features/chats/types/message";
import { reconcileFetchedMessageHistory } from "@/features/chats/utils/messageReconciliation";

type History = InfiniteData<MessageHistoryResponse>;
type HistoryFetch = { before?: History; fetchingNext: boolean };

const historyFetches = new WeakMap<History, HistoryFetch>();
const fetchStarts = new WeakMap<object, HistoryFetch>();

export const useMessages = (conversationId: string) => {
  return useInfiniteQuery<MessageHistoryResponse, Error, History, string[], string | undefined>({
    queryKey: ["messages", conversationId],

    queryFn: ({ pageParam }) =>
      getMessages(conversationId, {
        limit: 50,
        cursor: pageParam,
      }),

    initialPageParam: undefined as string | undefined,

    // The persister wraps the full infinite fetch, including all refetched pages.
    // Associate its result with the starting cache so structuralSharing can merge
    // against the live cache at the actual write, including later socket updates.
    persister: async (fetch, context, query) => {
      // TanStack can resume a multi-page fetch at the failed page on retry.
      const snapshot = fetchStarts.get(fetch) ?? {
        before: query.state.data as History | undefined,
        fetchingNext: query.state.fetchMeta?.fetchMore?.direction === "forward",
      };
      fetchStarts.set(fetch, snapshot);
      const result = await fetch(context as Parameters<typeof fetch>[0]);
      historyFetches.set(result as unknown as History, snapshot);
      return result;
    },

    structuralSharing: (oldData, newData) => {
      const result = newData as History;
      const snapshot = historyFetches.get(result);
      if (!snapshot) return replaceEqualDeep(oldData, newData);
      historyFetches.delete(result);
      return replaceEqualDeep(oldData, reconcileFetchedMessageHistory(
        result, snapshot.before, oldData as History | undefined, snapshot.fetchingNext,
      ));
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor ?? undefined;
    },

    enabled: !!conversationId,
  });
};

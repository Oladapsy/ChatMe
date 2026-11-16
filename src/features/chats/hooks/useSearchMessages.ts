import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { searchMessages } from "@/features/chats/api/chatApi";
import { reconcileSearchItems } from "@/features/chats/utils/reconcileMessageSearch";
import type { MessageHistoryResponse } from "@/features/chats/types/message";

export function useSearchMessages(conversationId: string, query: string) {
  const normalizedQuery = query.trim();
  const client = useQueryClient();

  return useInfiniteQuery({
    queryKey: ["messages", "search", conversationId, normalizedQuery],

    initialPageParam: undefined as string | undefined,

    queryFn: async ({ pageParam }) => {
      const page = await searchMessages(conversationId, {
        q: normalizedQuery,
        limit: 50,
        ...(pageParam ? { cursor: pageParam } : {}),
      });
      // A search started before an edit/recovery may finish afterwards.
      const history = client.getQueryData<InfiniteData<MessageHistoryResponse>>(["messages", conversationId]);
      return { ...page, items: reconcileSearchItems(page.items, history?.pages.flatMap(item => item.items) ?? [], normalizedQuery) };
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage || !lastPage.pageInfo.nextCursor) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor;
    },

    enabled: Boolean(conversationId && normalizedQuery),
  });
}

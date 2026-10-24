import { useInfiniteQuery } from "@tanstack/react-query";
import { searchMessages } from "@/features/chats/api/chatApi";

export function useSearchMessages(conversationId: string, query: string) {
  const normalizedQuery = query.trim();

  return useInfiniteQuery({
    queryKey: ["messages", "search", conversationId, normalizedQuery],

    initialPageParam: undefined as string | undefined,

    queryFn: ({ pageParam }) =>
      searchMessages(conversationId, {
        q: normalizedQuery,
        limit: 50,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage || !lastPage.pageInfo.nextCursor) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor;
    },

    enabled: Boolean(conversationId && normalizedQuery),
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/features/chats/api/chatApi";

export const useMessages = (conversationId: string) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId],

    queryFn: ({ pageParam }) =>
      getMessages(conversationId, {
        limit: 50,
        cursor: pageParam,
      }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor ?? undefined;
    },

    enabled: !!conversationId,
  });
};
import { useQuery } from "@tanstack/react-query";
import { searchMessages } from "@/features/chats/api/chatApi";

export function useSearchMessages(conversationId: string, query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["messages", "search", conversationId, normalizedQuery],
    queryFn: () =>
      searchMessages(conversationId, {
        q: normalizedQuery,
        limit: 50,
      }),
    enabled: Boolean(conversationId && normalizedQuery),
  });
}

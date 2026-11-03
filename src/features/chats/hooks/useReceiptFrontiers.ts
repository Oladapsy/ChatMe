import { useQuery } from "@tanstack/react-query";
import { getReceiptFrontiers } from "@/features/chats/api/chatApi";

export const useReceiptFrontiers = (conversationId: string) => {
  return useQuery({
    queryKey: ["receipts", conversationId],
    queryFn: () => getReceiptFrontiers(conversationId),
    enabled: !!conversationId,
  });
};

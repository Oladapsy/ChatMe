import { useQuery } from "@tanstack/react-query";
import { getArchivedConversations } from "@/features/chats/api/chatApi";

export const useArchivedConversations = () => {
  return useQuery({
    queryKey: ["archived-conversations"],
    queryFn: getArchivedConversations,
  });
};
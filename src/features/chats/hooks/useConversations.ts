import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/features/chats/api/chatApi";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });
};

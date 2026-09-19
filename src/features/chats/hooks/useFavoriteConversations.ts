import { useQuery } from "@tanstack/react-query";

import { getFavoriteConversations } from "@/features/chats/api/chatApi";

export const useFavoriteConversations = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteConversations,
  });
};

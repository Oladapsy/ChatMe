import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  favoriteConversation,
  unfavoriteConversation,
} from "@/features/chats/api/chatApi";

export const useConversationFavorite = () => {
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: favoriteConversation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const unfavoriteMutation = useMutation({
    mutationFn: unfavoriteConversation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    favorite: favoriteMutation.mutate,
    unfavorite: unfavoriteMutation.mutate,
    isPending:
      favoriteMutation.isPending ||
      unfavoriteMutation.isPending,
  };
};
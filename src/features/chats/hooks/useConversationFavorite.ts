import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";
import {
  favoriteConversation,
  unfavoriteConversation,
} from "@/features/chats/api/chatApi";

export const useConversationFavorite = () => {
  const queryClient = useQueryClient();

  const favoriteMutation = useSessionMutation({
    mutationFn: favoriteConversation,

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const unfavoriteMutation = useSessionMutation({
    mutationFn: unfavoriteConversation,

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favorite: favoriteMutation.mutate,
    unfavorite: unfavoriteMutation.mutate,
    isPending: favoriteMutation.isPending || unfavoriteMutation.isPending,
  };
};

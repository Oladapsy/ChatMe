import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  archiveConversation,
  unarchiveConversation,
} from "@/features/chats/api/chatApi";

export const useConversationArchive = () => {
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: archiveConversation,

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["archived-conversations"],
      });
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveConversation,

    onSuccess: () => {
      for (const key of ["favorites", "archived-conversations", "conversation", "group-details"]) void queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.invalidateQueries({
        queryKey: ["archived-conversations"],
      });
    },
  });

  return {
    archive: archiveMutation.mutate,
    unarchive: unarchiveMutation.mutate,
    isPending: archiveMutation.isPending || unarchiveMutation.isPending,
  };
};

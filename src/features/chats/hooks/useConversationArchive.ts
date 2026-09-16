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
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: unarchiveConversation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });

  return {
    archive: archiveMutation.mutate,
    unarchive: unarchiveMutation.mutate,
    isPending:
      archiveMutation.isPending || unarchiveMutation.isPending,
  };
};
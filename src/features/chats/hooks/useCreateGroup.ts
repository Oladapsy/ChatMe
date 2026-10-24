import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  type CreateGroupPayload,
} from "@/features/chats/api/chatApi";

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => createGroup(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};

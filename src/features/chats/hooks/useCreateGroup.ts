import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  getConversationById,
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


// group details fetch hook

export function useGroupDetails(conversationId: string) {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationById(conversationId),
    enabled: Boolean(conversationId),
  });
}

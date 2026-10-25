import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  getConversationById,
  updateGroupAvatar,
  type CreateGroupPayload,
} from "@/features/chats/api/chatApi";
import {
  updateGroup,
  type UpdateGroupPayload,
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

// update group details hook


interface UpdateGroupVariables {
  conversationId: string;
  name: string;
  mediaId?: string;
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      name,
      mediaId,
    }: UpdateGroupVariables) => {
      // Update the group name.
      await updateGroup(conversationId, { name });

      // Update the avatar only when a new photo was uploaded.
      if (mediaId) {
        await updateGroupAvatar(conversationId, { mediaId });
      }
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["conversation", variables.conversationId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        }),
      ]);
    },
  });
}


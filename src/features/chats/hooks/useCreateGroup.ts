import { getSessionGeneration } from "@/services/authStorage";
import { SessionChangedError, useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

  return useSessionMutation({
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

  return useSessionMutation({
    mutationFn: async ({
      conversationId,
      name,
      mediaId,
    }: UpdateGroupVariables) => {
      const generation = getSessionGeneration();
      // Update the group name.
      await updateGroup(conversationId, { name });

      if (generation !== getSessionGeneration()) throw new SessionChangedError();

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


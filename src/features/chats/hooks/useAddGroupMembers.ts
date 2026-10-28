import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGroupMembers, AddGroupMembersPayload } from "../api/chatApi";

interface AddGroupMembersVariables {
  conversationId: string;
  payload: AddGroupMembersPayload;
}

export function useAddGroupMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, payload }: AddGroupMembersVariables) =>
      addGroupMembers(conversationId, payload),

    onSuccess: async (updatedGroup, variables) => {
      queryClient.setQueryData(
        ["conversation", variables.conversationId],
        updatedGroup,
      );

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

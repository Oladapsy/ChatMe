import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  removeGroupMember,
  updateGroupMemberRole,
  transferGroupOwnership,
  leaveGroup,
  type GroupMemberRole,
} from "@/features/chats/api/chatApi";

export function useRemoveGroupMember(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      removeGroupMember(conversationId, memberId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

export function useUpdateGroupMemberRole(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: GroupMemberRole;
    }) => updateGroupMemberRole(conversationId, memberId, { role }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

export function useTransferGroupOwnership(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newOwnerId: string) =>
      transferGroupOwnership(conversationId, { newOwnerId }),

    onSuccess: async (updatedGroup) => {
      // Update the group details immediately with the server response.
      queryClient.setQueryData(["conversation", conversationId], updatedGroup);

      await queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

export function useLeaveGroup(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => leaveGroup(conversationId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });

      queryClient.removeQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });
    },
  });
}

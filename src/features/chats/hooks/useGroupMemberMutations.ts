import { useSessionMutation } from "@/shared/hooks/useSessionMutation";
import { useQueryClient } from "@tanstack/react-query";

import {
  removeGroupMember,
  updateGroupMemberRole,
  transferGroupOwnership,
  leaveGroup,
  type GroupMemberRole,
} from "@/features/chats/api/chatApi";

export function useRemoveGroupMember(conversationId: string) {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: (memberId: string) =>
      removeGroupMember(conversationId, memberId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });
}

export function useUpdateGroupMemberRole(conversationId: string) {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: GroupMemberRole;
    }) => updateGroupMemberRole(conversationId, memberId, { role }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });
}

export function useTransferGroupOwnership(conversationId: string) {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: (newOwnerId: string) =>
      transferGroupOwnership(conversationId, { newOwnerId }),

    onSuccess: async (updatedGroup) => {
      // Update the group details immediately with the server response.
      queryClient.setQueryData(["conversation", conversationId], updatedGroup);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["conversations"] }),
      ]);
    },
  });
}

export function useLeaveGroup(conversationId: string) {
  const queryClient = useQueryClient();

  return useSessionMutation({
    mutationFn: () => leaveGroup(conversationId),

    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ["conversation", conversationId],
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { getBlockedUsers } from "@/features/contacts/api/blocksApi";

export const BLOCKED_USERS_QUERY_KEY = ["blocked-users"] as const;

export function useBlockedUsers() {
  return useQuery({
    queryKey: BLOCKED_USERS_QUERY_KEY,
    queryFn: getBlockedUsers,
  });
}

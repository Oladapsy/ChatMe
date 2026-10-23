
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/features/contacts/api/discoveryApi";

export function useSearchUsers(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: ["user-search", normalizedQuery],
    queryFn: () => searchUsers(normalizedQuery, 20),
    enabled: normalizedQuery.length >= 2,
    staleTime: 30_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/api/authApi";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}
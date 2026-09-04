import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "@/features/auth/api/authApi";

export function useRequestOtp() {
  return useMutation({
    mutationFn: requestOtp,
  });
}
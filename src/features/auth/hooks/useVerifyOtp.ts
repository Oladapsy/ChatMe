import { useMutation } from "@tanstack/react-query";
import { verifyOtp } from "@/features/auth/api/authApi";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtp,
  });
}
import { useMutation } from "@tanstack/react-query";
import { resendOtp } from "@/features/auth/api/authApi";

export function useResendOtp() {
  return useMutation({
    mutationFn: resendOtp,
  });
}
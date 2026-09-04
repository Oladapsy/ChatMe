import { api } from "@/services/api";

export type RequestOtpPayload = {
  phoneNumber: string;
};

export type RequestOtpResponse = {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
};

export async function requestOtp(
  payload: RequestOtpPayload,
): Promise<RequestOtpResponse> {
  const response = await api.post<RequestOtpResponse>(
    "/auth/otp/request",
    payload,
  );

  return response.data;
}

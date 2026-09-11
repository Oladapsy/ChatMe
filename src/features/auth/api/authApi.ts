import { api } from "@/services/api";

export type RequestOtpPayload = {
  phoneNumber: string;
};

export type ResendOtpPayload = {
  challengeId: string;
};

export type RequestOtpResponse = {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
};

export type VerifyOtpPayload = {
  challengeId: string;
  code: string;
  device: {
    name: string;
    platform: "ios" | "android" | "web" | "unknown";
  };
};

export type VerifyOtpUser = {
  id: string;
  phoneNumber: string;
  displayName: string;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
};

export type VerifyOtpResponse = {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: VerifyOtpUser;
};

export type MeUser = {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
};

export type UpdateMePayload = {
  displayName?: string;
};

export type RefreshResponse = {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: MeUser;
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

export async function resendOtp(
  payload: ResendOtpPayload,
): Promise<RequestOtpResponse> {
  const response = await api.post<RequestOtpResponse>(
    "/auth/otp/resend",
    payload,
  );

  return response.data;
}

export async function verifyOtp(
  payload: VerifyOtpPayload,
): Promise<VerifyOtpResponse> {
  const response = await api.post<VerifyOtpResponse>(
    "/auth/otp/verify",
    payload,
  );

  return response.data;
}

export async function getMe(): Promise<MeUser> {
  const response = await api.get<MeUser>("/me");

  return response.data;
}

export async function updateMe(payload: UpdateMePayload): Promise<MeUser> {
  const response = await api.patch<MeUser>("/me", payload);

  return response.data;
}

// update avatar payload or type -> New
export type UpdateAvatarPayload = {
  mediaId: string;
};

// update profile picture -> New
export async function updateAvatar(
  payload: UpdateAvatarPayload,
): Promise<MeUser> {
  const response = await api.put<MeUser>("/me/avatar", payload);

  return response.data;
}

// remove avatar -> New
export async function removeAvatar(): Promise<void> {
  await api.delete("/me/avatar");
}


// Logout
export async function logout(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", {
    refreshToken,
  });
}
import { api } from "@/services/api";

export type MediaPurpose =
  | "profile_avatar"
  | "group_avatar"
  | "message_attachment";

export type MediaStatus =
  | "pending"
  | "ready"
  | "failed"
  | "deleted";

export type MediaType =
  | "image"
  | "audio"
  | "video"
  | "document";

// the body for the upload
export type CreateMediaUploadPayload = {
  clientUploadId: string;
  purpose: MediaPurpose;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
};

export type Media = {
  id: string;
  purpose: MediaPurpose;
  status: MediaStatus;
  type: MediaType;
  contentType: string;
  sizeBytes: number;
  originalFilename: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  secureUrl: string | null;
  createdAt: string;
  expiresAt: string;
  completedAt: string | null;
};

export type CloudinaryUpload = {
  url: string;
  method: "POST";
  expiresAt: string;
  fields: Record<string, string>;
};

// the response
export type CreateMediaUploadResponse = {
  media: Media;
  upload: CloudinaryUpload | null;
};


// create the upload request
export async function createMediaUpload(
  payload: CreateMediaUploadPayload,
): Promise<CreateMediaUploadResponse> {
  const response = await api.post<CreateMediaUploadResponse>(
    "/media/uploads",
    payload,
  );

  return response.data;
}

export async function completeMediaUpload(
  mediaId: string,
): Promise<Media> {
  const response = await api.post<Media>(
    `/media/uploads/${mediaId}/complete`,
  );

  return response.data;
}
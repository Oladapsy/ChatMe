import {
  createMediaUpload,
  completeMediaUpload,
  type MediaPurpose,
  type Media,
  type CreateMediaUploadResponse,
} from "@/services/mediaApi";

import { uploadToCloudinary } from "@/services/cloudinary";
import * as Crypto from "expo-crypto";

export type UploadProgress = { authorization?: CreateMediaUploadResponse; uploaded?: boolean };

type UploadMediaParams = {
  progress?: UploadProgress;
  clientUploadId?: string;
  uri: string;
  purpose: MediaPurpose;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
};

export async function uploadMedia({
  progress = {},
  clientUploadId = Crypto.randomUUID(),
  uri,
  purpose,
  contentType,
  sizeBytes,
  originalFilename,
}: UploadMediaParams): Promise<Media> {
  const response = progress.authorization ?? await createMediaUpload({
    clientUploadId,
    purpose,
    contentType,
    sizeBytes,
    originalFilename,
  });

  progress.authorization = response;
  if (response.media.status === "ready") return response.media;

  if (response.upload && !progress.uploaded) {
    await uploadToCloudinary({
      uri,
      uploadUrl: response.upload.url,
      fields: response.upload.fields,
      contentType,
      filename: originalFilename,
    });
  }

  progress.uploaded = true;
  return await completeMediaUpload(response.media.id);
}

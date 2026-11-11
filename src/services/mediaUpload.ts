import {
  createMediaUpload,
  completeMediaUpload,
  type MediaPurpose,
  type Media,
  type CreateMediaUploadResponse,
} from "@/services/mediaApi";

import { uploadToCloudinary } from "@/services/cloudinary";
import { getSessionGeneration } from "@/services/authStorage";
import * as Crypto from "expo-crypto";

export type UploadProgress = { generation?: number; authorization?: CreateMediaUploadResponse; uploaded?: boolean };

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
  const generation = progress.generation ?? getSessionGeneration();
  progress.generation = generation;
  const checkSession = () => { if (generation !== getSessionGeneration()) throw new Error("Account changed. Start this upload again in the original account."); };
  checkSession();
  const response = progress.authorization ?? await createMediaUpload({
    clientUploadId,
    purpose,
    contentType,
    sizeBytes,
    originalFilename,
  }, generation);
  checkSession();

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

  checkSession();
  progress.uploaded = true;
  const media = await completeMediaUpload(response.media.id, generation);
  checkSession();
  return media;
}

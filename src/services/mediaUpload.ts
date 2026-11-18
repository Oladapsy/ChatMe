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

export type UploadProgress = { generation?: number; clientUploadId?: string; authorization?: CreateMediaUploadResponse; authorizationRejected?: boolean; uploaded?: boolean };
export type UploadCheckpoint = () => Promise<void>;

type UploadMediaParams = {
  progress?: UploadProgress;
  onProgress?: UploadCheckpoint;
  clientUploadId?: string;
  uri: string;
  purpose: MediaPurpose;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
};

export async function uploadMedia({
  progress = {},
  onProgress,
  clientUploadId,
  uri,
  purpose,
  contentType,
  sizeBytes,
  originalFilename,
}: UploadMediaParams): Promise<Media> {
  const generation = progress.generation ?? getSessionGeneration();
  progress.generation = generation;
  const checkSession = () => { if (generation !== getSessionGeneration()) throw new Error("Account changed. Start this upload again in the original account."); };
  const checkpoint = async () => {
    checkSession();
    await onProgress?.();
    checkSession();
  };
  checkSession();
  if (progress.clientUploadId && clientUploadId && progress.clientUploadId !== clientUploadId) throw new Error("Upload identity changed");
  progress.clientUploadId ??= clientUploadId ?? Crypto.randomUUID();
  await checkpoint();
  const expired = (authorization: CreateMediaUploadResponse) => {
    const expiresAt = Date.parse(authorization.upload?.expiresAt ?? "");
    return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
  };
  const rejectedAuthorization = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    return /(expired|stale).*(signature|timestamp|authorization)|(signature|timestamp|authorization).*expir/i.test(message);
  };
  const authorize = async () => {
    const previousMediaId = progress.authorization?.media.id;
    // Repeat the idempotent creation request with the original upload ID.
    // The backend must renew pending authorization for this same media record.
    const response = await createMediaUpload({
      clientUploadId: progress.clientUploadId!, purpose, contentType, sizeBytes, originalFilename,
    }, generation);
    checkSession();
    if (previousMediaId && response.media.id !== previousMediaId) throw new Error("Upload renewal returned a different media record. Please retry later.");
    progress.authorization = response;
    progress.authorizationRejected = false;
    // Persist the authorized identity before transferring any bytes.
    await checkpoint();
    return response;
  };
  let response = progress.authorization;
  if (response?.media.status === "ready") return response.media;
  if (!response || (!progress.uploaded && (progress.authorizationRejected || expired(response)))) response = await authorize();

  if (response.media.status === "ready") return response.media;

  if (!progress.uploaded) {
    const transfer = async (authorization: CreateMediaUploadResponse) => {
      if (!authorization.upload) throw new Error("Upload authorization is unavailable. Please retry.");
      if (authorization.upload.expiresAt && expired(authorization)) throw new Error("Upload authorization has expired. Please retry.");
      await uploadToCloudinary({ uri, uploadUrl: authorization.upload.url, fields: authorization.upload.fields, contentType, filename: originalFilename });
    };
    try {
      await transfer(response);
    } catch (error) {
      checkSession();
      if (!rejectedAuthorization(error)) throw error;
      progress.authorizationRejected = true;
      response = await authorize();
      if (response.media.status === "ready") return response.media;
      // Only one renewal/transfer per attempt; repeated failures remain retryable.
      try { await transfer(response); }
      catch (retryError) {
        if (expired(response) || rejectedAuthorization(retryError)) progress.authorizationRejected = true;
        throw retryError;
      }
    }
  }

  checkSession();
  progress.uploaded = true;
  // A fresh process can now retry completion without repeating the transfer.
  // Await this even on a retry: a previous checkpoint may have failed to write.
  await checkpoint();
  const media = await completeMediaUpload(response.media.id, generation);
  checkSession();
  if (media.status === "ready") progress.authorization = { media, upload: null };
  await checkpoint();
  return media;
}

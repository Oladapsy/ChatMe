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

export type UploadProgress = { generation?: number; originalClientUploadId?: string; clientUploadId?: string; authorization?: CreateMediaUploadResponse; authorizationRejected?: boolean; uploaded?: boolean };
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
  const originalId = progress.originalClientUploadId ?? progress.clientUploadId ?? clientUploadId ?? Crypto.randomUUID();
  if (clientUploadId && originalId !== clientUploadId) throw new Error("Upload identity changed");
  progress.originalClientUploadId = originalId;
  progress.clientUploadId ??= originalId;
  await checkpoint();
  const expired = (authorization: CreateMediaUploadResponse) => {
    const expiresAt = Date.parse(authorization.upload?.expiresAt ?? "");
    return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
  };
  const rejectedAuthorization = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    return /(expired|stale).*(signature|timestamp|authorization)|(signature|timestamp|authorization).*expir/i.test(message);
  };
  const expiredAttempt = (error: unknown) => {
    const response = (error as { response?: { status?: number; data?: { code?: string; error?: { code?: string } } } })?.response;
    return response?.status === 410 && (response.data?.error?.code ?? response.data?.code) === "MEDIA_UPLOAD_EXPIRED";
  };
  let replacedAttempt = false;
  const startNewAttempt = async () => {
    checkSession();
    if (replacedAttempt) throw new Error("Upload authorization expired again. Please retry.");
    // The backend cannot renew an expired pending record. The logical attachment
    // keeps its original ID, while this new upload attempt owns a new media ID.
    progress.clientUploadId = Crypto.randomUUID();
    progress.authorization = undefined;
    progress.authorizationRejected = false;
    progress.uploaded = false;
    replacedAttempt = true;
    // Persist the attempt ID before POST: a lost response must replay this ID.
    await checkpoint();
  };
  const requestAuthorization = () => createMediaUpload({
    clientUploadId: progress.clientUploadId!, purpose, contentType, sizeBytes, originalFilename,
  }, generation);
  const authorize = async (replaceRejected = false) => {
    let response: CreateMediaUploadResponse;
    try {
      // Replay first: an already-ready original asset must still be reused.
      response = await requestAuthorization();
    } catch (error) {
      checkSession();
      if (!expiredAttempt(error)) throw error;
      await startNewAttempt();
      response = await requestAuthorization();
    }
    checkSession();
    const previousMediaId = progress.authorization?.media.id;
    if (previousMediaId && response.media.id !== previousMediaId) throw new Error("Upload replay returned a different media record for the same attempt. Please retry later.");
    if (replaceRejected && response.media.status !== "ready" && !replacedAttempt) {
      // A pre-expiry replay returns the same signing fields. A signature already
      // rejected by the provider therefore needs a fresh attempt too.
      await startNewAttempt();
      response = await requestAuthorization();
      checkSession();
    }
    progress.authorization = response;
    progress.authorizationRejected = false;
    await checkpoint();
    return response;
  };
  let response = progress.authorization;
  if (response?.media.status === "ready") return response.media;
  if (!response || (!progress.uploaded && (progress.authorizationRejected || expired(response)))) response = await authorize(!!progress.authorizationRejected);

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
      await checkpoint();
      response = await authorize(true);
      if (response.media.status === "ready") return response.media;
      // Replace at most one attempt per invocation; further failures stay retryable.
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

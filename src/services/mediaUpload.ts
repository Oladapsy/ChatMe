import {
  createMediaUpload,
  completeMediaUpload,
  type MediaPurpose,
  type Media,
} from "@/services/mediaApi";

import { uploadToCloudinary } from "@/services/cloudinary";
import * as Crypto from "expo-crypto";

type UploadMediaParams = {
  uri: string;
  purpose: MediaPurpose;
  contentType: string;
  sizeBytes: number;
  originalFilename: string;
};

export async function uploadMedia({
  uri,
  purpose,
  contentType,
  sizeBytes,
  originalFilename,
}: UploadMediaParams): Promise<Media> {
  const response = await createMediaUpload({
    clientUploadId: Crypto.randomUUID(),
    purpose,
    contentType,
    sizeBytes,
    originalFilename,
  });

  console.log("MEDIA CREATE RESPONSE:", response);
  console.log("CLOUDINARY FIELDS:", response.upload?.fields);

  if (response.upload) {
    await uploadToCloudinary({
      uri,
      uploadUrl: response.upload.url,
      fields: response.upload.fields,
      contentType,
      filename: originalFilename,
    });
  }

  return await completeMediaUpload(response.media.id);
}

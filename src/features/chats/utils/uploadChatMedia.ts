
import { File } from "expo-file-system";
import { uploadMedia } from "@/services/mediaUpload";

export async function uploadChatImage(uri: string): Promise<string> {
  const file = new File(uri);
  const extension = file.name.split(".").pop()?.toLowerCase();

  const mimeType =
    extension === "webp"
      ? "image/webp"
      : extension === "png"
        ? "image/png"
        : "image/jpeg";

  const media = await uploadMedia({
    uri,
    purpose: "message_attachment",
    contentType: mimeType,
    sizeBytes: file.size,
    originalFilename: file.name,
  });

  return media.id;
}


// for the audio

export async function uploadChatAudio(
  uri: string,
  durationSec: number
): Promise<string> {
  const file = new File(uri);
  const base64 = await file.base64();
  const sizeBytes = Math.floor((base64.length * 3) / 4);

  const media = await uploadMedia({
    uri,
    purpose: "message_attachment",
    contentType: "audio/m4a",
    sizeBytes,
    originalFilename: file.name,
  });

  return media.id;
}

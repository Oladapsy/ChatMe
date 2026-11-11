
import { File } from "expo-file-system";
import { uploadMedia, type UploadProgress } from "@/services/mediaUpload";

export async function uploadChatImage(uri: string, clientUploadId?: string, progress?: UploadProgress): Promise<string> {
  const file = new File(uri);
  const extension = file.name.split(".").pop()?.toLowerCase();

  const formats: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif" };
  const mimeType = formats[extension ?? ""];
  if (!file.exists || file.size <= 0) throw new Error("Image is missing or empty");
  if (!mimeType) throw new Error("Unsupported image format. Choose JPEG, PNG, WebP or HEIF.");

  const media = await uploadMedia({
    uri,
    clientUploadId,
    progress,
    purpose: "message_attachment",
    contentType: mimeType,
    sizeBytes: file.size,
    originalFilename: file.name,
  });

  return media.id;
}


export async function uploadChatAudio(uri: string, durationSec: number, clientUploadId?: string, progress?: UploadProgress): Promise<string> {
  const file = new File(uri);
  if (!file.exists || file.size <= 0) throw new Error("Recording is missing or empty");
  const types: Record<string, string> = { m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", wav: "audio/wav", webm: "audio/webm", caf: "audio/x-caf" };
  const contentType = types[file.extension.replace(".", "").toLowerCase()] || file.type;
  if (!contentType) throw new Error("Unknown recording format");
  const media = await uploadMedia({ uri, purpose: "message_attachment", contentType, sizeBytes: file.size, originalFilename: file.name, clientUploadId, progress });
  return media.id;
}

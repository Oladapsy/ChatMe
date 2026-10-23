
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

import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

export type CloudinaryUploadParams = {
  uri: string;
  uploadUrl: string;
  fields: Record<string, string>;
  contentType: string;
  filename: string;
};

export async function uploadToCloudinary({
  uri,
  uploadUrl,
  fields,
  contentType,
  filename,
}: CloudinaryUploadParams) {
  const file = new File(uri);

  if (!file.exists) {
    throw new Error("Selected attachment file does not exist");
  }

  // Send multipart bytes directly. React Native's Blob constructor cannot
  // accept ArrayBuffer on Android; no Blob or data-URL conversion is needed.
  const boundary = `chatme-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const encoder = new TextEncoder();
  const quote = (value: string) => value.replace(/["\r\n]/g, "_");
  const chunks: Uint8Array[] = [];
  for (const [key, value] of Object.entries(fields)) {
    chunks.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="${quote(key)}"\r\n\r\n${value}\r\n`));
  }
  chunks.push(encoder.encode(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${quote(filename)}"\r\nContent-Type: ${contentType}\r\n\r\n`));
  chunks.push(new Uint8Array(await file.arrayBuffer()));
  chunks.push(encoder.encode(`\r\n--${boundary}--\r\n`));
  const body = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();

    let reason = "Upload was rejected";
    try {
      const body = JSON.parse(errorText);
      if (typeof body.error?.message === "string") reason = body.error.message;
    } catch { /* Cloudinary may return a non-JSON error response. */ }
    throw new Error(`Attachment upload failed (${response.status}): ${reason}`);
  }

  return response.json();
}

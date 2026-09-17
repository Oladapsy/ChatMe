import { File } from "expo-file-system";

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
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const file = new File(uri);

  if (!file.exists) {
    throw new Error("Selected image file does not exist");
  }

  const base64 = await file.base64();

  const blob = await fetch(`data:${contentType};base64,${base64}`).then(
    (response) => response.blob(),
  );

  formData.append("file", blob, filename);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.log("Cloudinary upload failed:", {
      status: response.status,
      body: errorText,
    });

    throw new Error("Cloudinary upload failed");
  }

  return response.json();
}

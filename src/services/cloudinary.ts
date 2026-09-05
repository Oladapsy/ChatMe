import axios from "axios";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(uri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "profile-photo.jpg",
  } as any);

  formData.append("upload_preset", UPLOAD_PRESET!);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
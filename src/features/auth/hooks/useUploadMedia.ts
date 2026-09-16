// a small test hook

import { useMutation } from "@tanstack/react-query";
import { uploadMedia } from "@/services/mediaUpload";

export function useUploadMedia() {
  return useMutation({
    mutationFn: uploadMedia,
  });
}
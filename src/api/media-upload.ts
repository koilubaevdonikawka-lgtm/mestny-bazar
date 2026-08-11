import { uploadImageFn } from "@/api/media-upload.functions";
import type { MediaUploadContext } from "@shared/contracts/media-upload";

export async function uploadImage(file: File, context: MediaUploadContext): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);
  const result = await uploadImageFn({ data: formData });
  return result.url;
}

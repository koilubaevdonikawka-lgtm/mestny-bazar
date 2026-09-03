import { uploadImageFn } from "@/api/media-upload.functions";
import type { MediaUploadContext } from "@shared/contracts/media-upload";

/**
 * Задача №250 — skipAiProcessing is meaningful only for the PRODUCT
 * context (MultiImageUploadField's own AI-processing toggle); every other
 * context ignores it server-side, so passing it elsewhere is harmless.
 */
export async function uploadImage(
  file: File,
  context: MediaUploadContext,
  skipAiProcessing?: boolean,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);
  if (skipAiProcessing) {
    formData.append("skipAiProcessing", "true");
  }
  const result = await uploadImageFn({ data: formData });
  return result.url;
}

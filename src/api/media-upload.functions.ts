import { createServerFn } from "@tanstack/react-start";
import { mediaUploadContextSchema } from "@shared/validation/media-upload.schema";
import type { UploadImageResponse } from "@shared/contracts/media-upload";

export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected FormData");
    }
    const file = data.get("file");
    if (!(file instanceof File)) {
      throw new Error("Missing file");
    }
    return { context: mediaUploadContextSchema.parse(data.get("context")), file };
  })
  .handler(async ({ data }): Promise<UploadImageResponse> => {
    const { executeUploadImage } = await import("@server/functions/media-upload.executor");
    return executeUploadImage({
      context: data.context,
      contentType: data.file.type,
      size: data.file.size,
      data: data.file,
    });
  });

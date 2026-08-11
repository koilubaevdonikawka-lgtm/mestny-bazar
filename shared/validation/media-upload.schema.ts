import { z } from "zod";
import { MediaUploadContext } from "@shared/contracts/media-upload";

export const mediaUploadContextSchema = z.enum([
  MediaUploadContext.CATEGORY,
  MediaUploadContext.PRODUCT,
  MediaUploadContext.BANNER,
  MediaUploadContext.COURIER,
]);

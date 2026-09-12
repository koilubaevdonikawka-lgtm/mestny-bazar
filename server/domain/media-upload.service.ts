import { randomUUID } from "node:crypto";
import type { IStorageService } from "@server/ports/storage.service";
import type { IAiImageProvider } from "@server/ports/ai-image-provider.port";
import {
  MediaUploadProcessingError,
  MediaUploadValidationError,
} from "@server/domain/media-upload.errors";
import { logger } from "@shared/observability/logger";
import {
  MEDIA_UPLOAD_ALLOWED_MIME_TYPES,
  MEDIA_UPLOAD_MAX_BYTES,
  MediaUploadContext,
  type MediaUploadContext as MediaUploadContextType,
  type MediaUploadMimeType,
  type UploadImageResponse,
} from "@shared/contracts/media-upload";

export interface UploadImageInput {
  context: MediaUploadContextType;
  contentType: string;
  size: number;
  data: Blob;
  /**
   * Задача №250 — PRODUCT-only opt-out of processProductPhoto() for this
   * one upload (the admin already has a clean-background photo and wants
   * it stored as-is). Ignored for every other context — they never ran
   * through the AI provider to begin with. Default/undefined = processed,
   * same as before this flag existed.
   */
  skipAiProcessing?: boolean;
}

const EXTENSION_BY_MIME_TYPE: Record<MediaUploadMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

function isAllowedMimeType(value: string): value is MediaUploadMimeType {
  return (MEDIA_UPLOAD_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

/**
 * Single mechanism behind every "Загрузить изображение" button. Validates
 * server-side (never trust the client's own pre-check) before ever calling
 * Storage, then routes to the bucket matching the caller's context — category
 * images keep using the pre-existing category-images bucket (root-path, no
 * prefix, so existing objects/URLs are unaffected); everything else goes into
 * the new marketplace-media bucket under a context-prefixed path.
 *
 * PRODUCT context (Промпт №101) also runs the photo through the AI image
 * provider before storing — remove the background, replace it with clean
 * white, center the product. Re-enabled (Задача №248) after being
 * temporarily disabled (Промпт №107, over Gemini quota/reliability
 * concerns on the free tier — resolved now that the account is on a paid
 * plan). Every other context (category/banner/courier) is unaffected —
 * out of scope, Промпт №101 was PRODUCT-only from the start.
 */
export class MediaUploadService {
  constructor(
    private readonly categoryStorage: IStorageService,
    private readonly mediaStorage: IStorageService,
    private readonly aiImageProvider: IAiImageProvider,
  ) {}

  async uploadImage(input: UploadImageInput): Promise<UploadImageResponse> {
    if (!isAllowedMimeType(input.contentType)) {
      throw new MediaUploadValidationError(`Unsupported file type: ${input.contentType}`);
    }
    if (input.size > MEDIA_UPLOAD_MAX_BYTES) {
      throw new MediaUploadValidationError(`File exceeds ${MEDIA_UPLOAD_MAX_BYTES} bytes`);
    }

    const isCategory = input.context === MediaUploadContext.CATEGORY;
    const storage = isCategory ? this.categoryStorage : this.mediaStorage;

    // PRODUCT routes through processProductPhoto() first — Gemini's output
    // isn't guaranteed to keep the original file's mimeType (it commonly
    // returns PNG regardless of input), so the extension/content-type used
    // for storage must come from whatever was actually processed, not the
    // original upload.
    let data: Blob | Buffer = input.data;
    // Widened to `string` (not the narrower MediaUploadMimeType TS would
    // otherwise infer from the isAllowedMimeType guard above) — Gemini's
    // returned mimeType isn't validated against that allowlist, and
    // shouldn't need to be; EXTENSION_BY_MIME_TYPE's lookup below already
    // has a defensive fallback for anything unexpected.
    let contentType: string = input.contentType;
    if (input.context === MediaUploadContext.PRODUCT && !input.skipAiProcessing) {
      const processed = await this.processProductPhoto(input);
      data = processed.data;
      contentType = processed.contentType;
    }

    const ext = EXTENSION_BY_MIME_TYPE[contentType as MediaUploadMimeType] ?? "png";
    const path = isCategory ? `${randomUUID()}.${ext}` : `${input.context}/${randomUUID()}.${ext}`;

    const { url } = await storage.upload(path, data, contentType);
    return { url };
  }

  /**
   * Задача №248 — re-enabled, called from uploadImage() for the PRODUCT
   * context. Failure is never silent: a Gemini/network error is logged
   * with detail and surfaces to the caller as MediaUploadProcessingError
   * (a real upload failure, not a quiet fallback to the unprocessed
   * photo) — the admin/seller sees the upload failed and can retry, rather
   * than unknowingly publishing a photo with its original background.
   */
  private async processProductPhoto(
    input: UploadImageInput,
  ): Promise<{ data: Buffer; contentType: string }> {
    try {
      const imageData = Buffer.from(await input.data.arrayBuffer());
      const result = await this.aiImageProvider.removeBackground({
        imageData,
        mimeType: input.contentType,
      });
      return { data: result.imageData, contentType: result.mimeType };
    } catch (error) {
      logger.error("media-upload:background-removal-failed", { error });
      throw new MediaUploadProcessingError();
    }
  }
}

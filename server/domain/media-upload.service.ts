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
 * PRODUCT context (Промпт №101) used to also run the photo through the AI
 * image provider before storing (remove the background, replace it with
 * clean white, center the product) — temporarily disabled (Промпт №107,
 * see processProductPhoto()'s own comment); every context, including
 * PRODUCT, currently stores the uploaded file as-is.
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

    const ext = EXTENSION_BY_MIME_TYPE[input.contentType];
    const isCategory = input.context === MediaUploadContext.CATEGORY;
    const path = isCategory ? `${randomUUID()}.${ext}` : `${input.context}/${randomUUID()}.${ext}`;
    const storage = isCategory ? this.categoryStorage : this.mediaStorage;

    // PRODUCT used to route through processProductPhoto() (AI background
    // removal) here — temporarily disabled, see that method's own comment.
    // Every context, PRODUCT included, now takes this same direct path.
    const { url } = await storage.upload(path, input.data, input.contentType);
    return { url };
  }

  /**
   * Temporarily disabled (Промпт №107) — решение владельца продукта:
   * автоматическая очистка фона добавляла внешнюю зависимость от Gemini и
   * была источником сбоев загрузки; вместо неё — ручная загрузка уже
   * очищенных фото (см. подсказку в форме, MultiImageUploadField). Код
   * сохранён для возможного возврата в будущем, не вызывается из
   * uploadImage() — сам aiImageProvider остаётся в конструкторе именно
   * ради этого метода.
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

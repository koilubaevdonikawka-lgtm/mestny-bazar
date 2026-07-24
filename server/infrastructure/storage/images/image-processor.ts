import type { IStorageProvider } from "@server/infrastructure/storage/files";
import type { ImageVariant } from "@server/infrastructure/storage/images/image-variant";
import { DEFAULT_IMAGE_VARIANTS } from "@server/infrastructure/storage/images/image-variant";
import type { ImageMetadata } from "@server/infrastructure/storage/images/image-metadata";
import { ImageOptimizer } from "@server/infrastructure/storage/images/image-optimizer";

export interface ImageProcessingResult {
  readonly sourcePath: string;
  readonly metadata: ImageMetadata;
  readonly variants: Readonly<Record<string, string>>;
}

/** Orchestrates image upload and variant planning through the storage port. */
export class ImageProcessor {
  constructor(
    private readonly storage: IStorageProvider,
    private readonly optimizer: ImageOptimizer = new ImageOptimizer(),
  ) {
    Object.freeze(this);
  }

  async uploadImage(
    path: string,
    content: Uint8Array,
    contentType: string,
    variants: readonly ImageVariant[] = DEFAULT_IMAGE_VARIANTS,
  ): Promise<ImageProcessingResult> {
    const metadata = this.optimizer.extractMetadata(content, contentType);
    await this.storage.uploadFile({
      path,
      content,
      contentType,
      metadata: Object.freeze({
        imageFormat: metadata.format,
        ...(metadata.width !== undefined ? { imageWidth: String(metadata.width) } : {}),
        ...(metadata.height !== undefined ? { imageHeight: String(metadata.height) } : {}),
      }),
    });

    const variantPaths = await this.generateVariants(path, content, contentType, variants);
    return Object.freeze({
      sourcePath: path,
      metadata,
      variants: variantPaths,
    });
  }

  async generateVariants(
    sourcePath: string,
    content: Uint8Array,
    contentType: string,
    variants: readonly ImageVariant[] = DEFAULT_IMAGE_VARIANTS,
  ): Promise<Readonly<Record<string, string>>> {
    const results: Record<string, string> = {};

    for (const variant of variants) {
      const plan = this.optimizer.planVariant(sourcePath, content, contentType, variant);
      if (plan.strategy === "passthrough") {
        const uploaded = await this.storage.uploadFile({
          path: plan.destinationPath,
          content,
          contentType,
          metadata: Object.freeze({ variant: variant.name, sourcePath }),
        });
        results[variant.name] = uploaded.publicUrl ?? plan.destinationPath;
        continue;
      }

      results[variant.name] = plan.destinationPath;
    }

    return Object.freeze({ ...results });
  }
}

export type { ImageMetadata, ImageVariant } from "@server/infrastructure/storage/images/image-variant";
export { DEFAULT_IMAGE_VARIANTS } from "@server/infrastructure/storage/images/image-variant";

import type { ImageMetadata } from "@server/infrastructure/storage/images/image-metadata";
import type { ImageVariant } from "@server/infrastructure/storage/images/image-variant";
import { ImageMetadataReader } from "@server/infrastructure/storage/images/image-metadata";

export interface ImageOptimizationPlan {
  readonly sourcePath: string;
  readonly variant: ImageVariant;
  readonly destinationPath: string;
  readonly metadata: ImageMetadata;
  readonly strategy: "passthrough" | "resize_pending";
}

/** Plans image optimization without third-party processing libraries. */
export class ImageOptimizer {
  private readonly metadataReader = new ImageMetadataReader();

  extractMetadata(content: Uint8Array, contentType: string): ImageMetadata {
    return this.metadataReader.read(content, contentType);
  }

  buildVariantPath(sourcePath: string, variant: ImageVariant): string {
    const dotIndex = sourcePath.lastIndexOf(".");
    if (dotIndex === -1) {
      return `${sourcePath}${variant.suffix}`;
    }
    return `${sourcePath.slice(0, dotIndex)}${variant.suffix}${sourcePath.slice(dotIndex)}`;
  }

  planVariant(
    sourcePath: string,
    content: Uint8Array,
    contentType: string,
    variant: ImageVariant,
  ): ImageOptimizationPlan {
    const metadata = this.extractMetadata(content, contentType);
    const requiresResize =
      metadata.width !== undefined &&
      metadata.height !== undefined &&
      (metadata.width > variant.maxWidth || metadata.height > variant.maxHeight);

    return Object.freeze({
      sourcePath,
      variant,
      destinationPath: this.buildVariantPath(sourcePath, variant),
      metadata,
      strategy: requiresResize ? "resize_pending" : "passthrough",
    });
  }
}

export type { ImageOptimizationPlan };

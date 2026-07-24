import { createHash } from "node:crypto";

import type { AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type {
  IMediaMetadataService,
  IMediaQualityAnalyzer,
  MediaAnalysisResult,
  MediaAssetInput,
} from "@server/ports/marketplace-ai/media-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { AIWorker } from "@server/domain/marketplace-ai/ai-worker";

/** Analyzes product media quality and publishes photo.analysis.completed. */
export class AIMediaWorker extends AIWorker {
  readonly id = "ai-media-worker";

  constructor(
    private readonly metadata: IMediaMetadataService,
    private readonly analyzer: IMediaQualityAnalyzer,
    private readonly events: IMarketplaceEventBus,
  ) {
    super();
  }

  canHandle(event: MarketplaceEvent): boolean {
    return event.type === "order.created" || event.type === "product.media.analysis.requested";
  }

  async process(job: AIJob): Promise<AIJobResult> {
    const { productId, photos } = this.extractAnalysisInput(job.event);

    if (photos.length === 0) {
      const emptyResult = this.analyzer.analyze({ productId, assets: [] });
      await this.publishCompleted(job.id, productId, emptyResult);
      return this.toJobResult(job.id, "skipped", emptyResult);
    }

    const assets = await this.metadata.resolveAssets(photos);
    const analysis = this.analyzer.analyze({ productId, assets });
    await this.publishCompleted(job.id, productId, analysis);

    return this.toJobResult(job.id, "completed", analysis);
  }

  private extractAnalysisInput(event: MarketplaceEvent): {
    productId: string | null;
    photos: MediaAssetInput[];
  } {
    if (event.type === "product.media.analysis.requested") {
      return {
        productId: event.productId,
        photos: event.photos,
      };
    }

    if (event.type === "order.created") {
      return {
        productId: null,
        photos: this.extractPhotosFromOrder(event.order),
      };
    }

    return { productId: null, photos: [] };
  }

  private extractPhotosFromOrder(order: OrderDTO): MediaAssetInput[] {
    const seen = new Set<string>();
    const photos: MediaAssetInput[] = [];

    for (const item of order.items) {
      if (!item.productImageUrl || seen.has(item.productImageUrl)) {
        continue;
      }

      seen.add(item.productImageUrl);
      photos.push({
        id:
          item.productId ??
          createHash("sha256").update(item.productImageUrl).digest("hex").slice(0, 16),
        url: item.productImageUrl,
      });
    }

    return photos;
  }

  private async publishCompleted(
    jobId: string,
    productId: string | null,
    result: MediaAnalysisResult,
  ): Promise<void> {
    await this.events.publish({
      type: "photo.analysis.completed",
      jobId,
      productId,
      result,
    });
  }

  private toJobResult(
    jobId: string,
    status: AIJobResult["status"],
    mediaAnalysis: MediaAnalysisResult,
  ): AIJobResult {
    return {
      jobId,
      workerId: this.id,
      status,
      output: {
        mediaAnalysis,
        mediaScore: mediaAnalysis.mediaScore,
      },
      processedAt: new Date().toISOString(),
    };
  }
}

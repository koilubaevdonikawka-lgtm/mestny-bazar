import type { AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type {
  IMediaMetadataService,
  IMediaQualityAnalyzer,
  MediaAnalysisResult,
  MediaAssetInput,
} from "@server/ports/marketplace-ai/media-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import { AIWorker } from "@server/domain/marketplace-ai/ai-worker";

/**
 * Analyzes product media quality and publishes photo.analysis.completed.
 * Triggered by product.published (see AICatalogWorker's doc comment for the
 * same retargeting rationale — Этап 5).
 */
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
    return event.type === "product.published" || event.type === "product.media.analysis.requested";
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

    if (event.type === "product.published") {
      const product = event.product;
      if (!product.imageUrl) {
        return { productId: product.id, photos: [] };
      }
      return {
        productId: product.id,
        photos: [{ id: product.id, url: product.imageUrl }],
      };
    }

    return { productId: null, photos: [] };
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

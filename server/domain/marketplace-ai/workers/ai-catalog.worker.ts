import type { AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type {
  CatalogAnalysisResult,
  CatalogProductInput,
  ICatalogQualityAnalyzer,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import { AIWorker } from "@server/domain/marketplace-ai/ai-worker";

/**
 * Analyzes catalog listing quality and publishes catalog.analysis.completed.
 * Triggered by a seller actually publishing a product (product.published),
 * not by every order.created — analysis of a product's own listing quality
 * belongs to the product's lifecycle, not the customer's purchase (ai.md,
 * platform-lifecycle.md §5, the retargeting closed in Этап 5).
 */
export class AICatalogWorker extends AIWorker {
  readonly id = "ai-catalog-worker";

  constructor(
    private readonly analyzer: ICatalogQualityAnalyzer,
    private readonly events: IMarketplaceEventBus,
  ) {
    super();
  }

  canHandle(event: MarketplaceEvent): boolean {
    return (
      event.type === "product.published" || event.type === "product.catalog.analysis.requested"
    );
  }

  async process(job: AIJob): Promise<AIJobResult> {
    const items = this.extractAnalysisItems(job.event);

    if (items.length === 0) {
      const emptyResult = this.analyzer.analyze({
        productId: null,
        product: { name: "" },
      });
      await this.publishCompleted(job.id, null, emptyResult);
      return this.toJobResult(job.id, "skipped", emptyResult);
    }

    const primary = items[0]!;
    const analysis = this.analyzer.analyze({
      productId: primary.productId,
      product: primary.product,
    });

    await this.publishCompleted(job.id, primary.productId, analysis);
    return this.toJobResult(job.id, "completed", analysis);
  }

  private extractAnalysisItems(event: MarketplaceEvent): Array<{
    productId: string | null;
    product: CatalogProductInput;
  }> {
    if (event.type === "product.catalog.analysis.requested") {
      return [{ productId: event.productId, product: event.product }];
    }

    if (event.type === "product.published") {
      const product = event.product;
      return [
        {
          productId: product.id,
          product: {
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            currency: product.currency,
          },
        },
      ];
    }

    return [];
  }

  private async publishCompleted(
    jobId: string,
    productId: string | null,
    result: CatalogAnalysisResult,
  ): Promise<void> {
    await this.events.publish({
      type: "catalog.analysis.completed",
      jobId,
      productId,
      result,
    });
  }

  private toJobResult(
    jobId: string,
    status: AIJobResult["status"],
    catalogAnalysis: CatalogAnalysisResult,
  ): AIJobResult {
    return {
      jobId,
      workerId: this.id,
      status,
      output: {
        catalogAnalysis,
        catalogScore: catalogAnalysis.catalogScore,
      },
      processedAt: new Date().toISOString(),
    };
  }
}

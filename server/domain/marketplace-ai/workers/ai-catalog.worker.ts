import type { AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type {
  CatalogAnalysisResult,
  CatalogProductInput,
  ICatalogQualityAnalyzer,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { AIWorker } from "@server/domain/marketplace-ai/ai-worker";

/** Analyzes catalog listing quality and publishes catalog.analysis.completed. */
export class AICatalogWorker extends AIWorker {
  readonly id = "ai-catalog-worker";

  constructor(
    private readonly analyzer: ICatalogQualityAnalyzer,
    private readonly events: IMarketplaceEventBus,
  ) {
    super();
  }

  canHandle(event: MarketplaceEvent): boolean {
    return event.type === "order.created" || event.type === "product.catalog.analysis.requested";
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

    if (event.type === "order.created") {
      return this.extractProductsFromOrder(event.order);
    }

    return [];
  }

  private extractProductsFromOrder(order: OrderDTO): Array<{
    productId: string | null;
    product: CatalogProductInput;
  }> {
    const seen = new Set<string>();
    const items: Array<{ productId: string | null; product: CatalogProductInput }> = [];

    for (const lineItem of order.items) {
      const key = lineItem.productId ?? lineItem.productName;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      items.push({
        productId: lineItem.productId,
        product: {
          name: lineItem.productName,
          imageUrl: lineItem.productImageUrl,
          price: lineItem.unitPrice,
          currency: order.currency,
        },
      });
    }

    return items;
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

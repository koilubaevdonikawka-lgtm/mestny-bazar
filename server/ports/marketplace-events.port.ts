import type { OrderDTO } from "@shared/contracts/order";
import type { AggregatedAIJobResult, AIJob } from "@server/ports/marketplace-ai.port";
import type {
  CatalogAnalysisResult,
  CatalogProductInput,
} from "@server/ports/marketplace-ai/catalog-analysis.port";
import type { MediaAnalysisResult, MediaAssetInput } from "@server/ports/marketplace-ai/media-analysis.port";

/** Unified marketplace events routed through Marketplace Events. */
export type MarketplaceEvent =
  | { type: "order.created"; order: OrderDTO }
  | { type: "product.media.analysis.requested"; productId: string; photos: MediaAssetInput[] }
  | { type: "product.catalog.analysis.requested"; productId: string; product: CatalogProductInput }
  | { type: "ai.job.completed"; job: AIJob; result: AggregatedAIJobResult }
  | { type: "photo.analysis.completed"; jobId: string; productId: string | null; result: MediaAnalysisResult }
  | { type: "catalog.analysis.completed"; jobId: string; productId: string | null; result: CatalogAnalysisResult };

export type MarketplaceEventType = MarketplaceEvent["type"];

export type MarketplaceEventHandler<T extends MarketplaceEventType = MarketplaceEventType> = (
  event: Extract<MarketplaceEvent, { type: T }>,
) => Promise<void>;

/** In-memory event bus contract — publish/subscribe only (no external brokers). */
export interface IMarketplaceEventBus {
  publish(event: MarketplaceEvent): Promise<void>;
  subscribe<T extends MarketplaceEventType>(
    eventType: T,
    handler: MarketplaceEventHandler<T>,
  ): void;
}

import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import type { AIWorkerRegistry } from "@server/platform/ai/ai/registry";
import { AnalyticsInsightWorker } from "@server/platform/ai/ai/workers/analytics-insight.worker";
import { AutoModerationWorker } from "@server/platform/ai/ai/workers/auto-moderation.worker";
import { PricingSuggestionWorker } from "@server/platform/ai/ai/workers/pricing-suggestion.worker";
import { ProductDescriptionWorker } from "@server/platform/ai/ai/workers/product-description.worker";
import { ProductSeoWorker } from "@server/platform/ai/ai/workers/product-seo.worker";
import { ProductTranslationWorker } from "@server/platform/ai/ai/workers/product-translation.worker";
import { SupportAssistantWorker } from "@server/platform/ai/ai/workers/support-assistant.worker";

/** Registers built-in platform AI workers. */
export function registerDefaultAIWorkers(
  registry: AIWorkerRegistry,
  provider: IAIProvider,
): void {
  const workers = [
    new ProductDescriptionWorker(provider),
    new ProductSeoWorker(provider),
    new ProductTranslationWorker(provider),
    new AutoModerationWorker(provider),
    new SupportAssistantWorker(provider),
    new PricingSuggestionWorker(provider),
    new AnalyticsInsightWorker(provider),
  ];

  for (const worker of workers) {
    if (!registry.getWorker(worker.id)) {
      registry.register(worker);
    }
  }
}

export {
  ProductDescriptionWorker,
  ProductSeoWorker,
  ProductTranslationWorker,
  AutoModerationWorker,
  SupportAssistantWorker,
  PricingSuggestionWorker,
  AnalyticsInsightWorker,
};

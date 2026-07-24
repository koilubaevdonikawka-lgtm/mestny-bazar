/** Known AI task types mapped to worker identifiers. */
export const AITaskType = {
  ProductDescription: "product.description.generate",
  ProductSeo: "product.seo.generate",
  ProductTranslation: "product.translation.generate",
  ProductEnrich: "product.enrich",
  AutoModeration: "moderation.auto.review",
  SupportAssistant: "support.assistant.reply",
  PricingSuggestion: "pricing.suggestion.generate",
  AnalyticsInsight: "analytics.insight.generate",
} as const;

export type AITaskTypeValue = (typeof AITaskType)[keyof typeof AITaskType];

export const AIWorkerId = {
  ProductDescription: "product-description",
  ProductSeo: "product-seo",
  ProductTranslation: "product-translation",
  AutoModeration: "auto-moderation",
  SupportAssistant: "support-assistant",
  PricingSuggestion: "pricing-suggestion",
  AnalyticsInsight: "analytics-insight",
} as const;

const TASK_WORKER_PLAN: Readonly<Record<string, readonly string[]>> = Object.freeze({
  [AITaskType.ProductDescription]: [AIWorkerId.ProductDescription],
  [AITaskType.ProductSeo]: [AIWorkerId.ProductSeo],
  [AITaskType.ProductTranslation]: [AIWorkerId.ProductTranslation],
  [AITaskType.ProductEnrich]: [
    AIWorkerId.ProductDescription,
    AIWorkerId.ProductSeo,
    AIWorkerId.ProductTranslation,
  ],
  [AITaskType.AutoModeration]: [AIWorkerId.AutoModeration],
  [AITaskType.SupportAssistant]: [AIWorkerId.SupportAssistant],
  [AITaskType.PricingSuggestion]: [AIWorkerId.PricingSuggestion],
  [AITaskType.AnalyticsInsight]: [AIWorkerId.AnalyticsInsight],
});

const TASK_AGGREGATION_KEYS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  [AITaskType.ProductEnrich]: ["description", "seo", "translation"],
});

/** Resolves worker execution order for a task type. */
export function resolveWorkerPlan(taskType: string): readonly string[] {
  return TASK_WORKER_PLAN[taskType.trim()] ?? [];
}

/** Resolves aggregation keys for combined worker outputs. */
export function resolveAggregationKeys(taskType: string, workerIds: readonly string[]): readonly string[] {
  return TASK_AGGREGATION_KEYS[taskType.trim()] ?? workerIds;
}

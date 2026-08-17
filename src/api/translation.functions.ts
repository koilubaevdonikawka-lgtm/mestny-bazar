import { createServerFn } from "@tanstack/react-start";
import type { TranslateTextResult } from "@shared/contracts/ai-provider";
import { translateTextRequestSchema } from "@shared/validation/ai-provider.schema";

/**
 * Public (no auth gate) translation entry point — Промпт №092. Mirrors
 * listCategoriesFn/category.functions.ts: translating a category's own
 * already-public name carries the same anonymous-safe trust model as
 * reading the category list itself. Routed through cachedTranslationService
 * (Промпт №094) — a persistent cache in front of the existing, unmodified
 * AiTranslationService; this file adds no AI or caching logic of its own.
 */
export const translatePublicTextFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => translateTextRequestSchema.parse(data))
  .handler(async ({ data }): Promise<TranslateTextResult> => {
    const { getServices } = await import("@server/di/container");
    return getServices().cachedTranslationService.translate(data);
  });

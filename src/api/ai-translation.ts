import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import { translateTextFn } from "@/api/ai-translation.functions";

/**
 * Universal AI text-translation entry point (Промпт №088) — provider-
 * agnostic infrastructure. Not yet called from any page or feature.
 */
export async function translateText(request: TranslateTextRequest): Promise<TranslateTextResult> {
  return translateTextFn({ data: request });
}

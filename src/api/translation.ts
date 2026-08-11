import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import { translatePublicTextFn } from "@/api/translation.functions";

/** Public storefront text translation (Промпт №092) — currently used for category names. */
export async function translatePublicText(
  request: TranslateTextRequest,
): Promise<TranslateTextResult> {
  return translatePublicTextFn({ data: request });
}

import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";

/**
 * Port for any AI provider capable of text translation (Промпт №088).
 * The domain depends only on this interface — never on a concrete provider
 * class (PL-03, Dependency Rule) — so swapping providers is a new adapter
 * plus one line in ai-provider.factory.ts, with no change here or in
 * server/domain/ai-translation.service.ts (PL-09, Replaceable Adapters).
 */
export interface IAiTextProvider {
  translateText(request: TranslateTextRequest): Promise<TranslateTextResult>;
}

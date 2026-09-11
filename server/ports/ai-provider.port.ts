import type {
  TranslateTextRequest,
  TranslateTextResult,
  ReadImageTextRequest,
  ReadImageTextResult,
} from "@shared/contracts/ai-provider";

/**
 * Port for any AI provider capable of text translation (Промпт №088).
 * The domain depends only on this interface — never on a concrete provider
 * class (PL-03, Dependency Rule) — so swapping providers is a new adapter
 * plus one line in ai-provider.factory.ts, with no change here or in
 * server/domain/ai-translation.service.ts (PL-09, Replaceable Adapters).
 *
 * readTextFromImage (Задача №264) lives on this port, not IAiImageProvider —
 * grouped by what it returns (text), matching the split ai-image-provider.port.ts
 * already uses for "returns an edited image" (removeBackground). The
 * request happens to include an image; the result is still text.
 */
export interface IAiTextProvider {
  translateText(request: TranslateTextRequest): Promise<TranslateTextResult>;
  readTextFromImage(request: ReadImageTextRequest): Promise<ReadImageTextResult>;
}

import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import type {
  IAiImageProvider,
  RemoveBackgroundRequest,
  RemoveBackgroundResult,
} from "@server/ports/ai-image-provider.port";
import { logger } from "@shared/observability/logger";

/**
 * Fallback used until a real AI provider adapter is registered in
 * ai-provider.factory.ts (Промпт №088) — mirrors StubPaymentProvider's role
 * for Finik: the app must always be fully constructible regardless of AI
 * configuration. Throws a plain technical error, not a domain error —
 * AiTranslationService is responsible for wrapping any provider failure into
 * AiProviderError, exactly the same path a real provider's own failure
 * would take.
 */
export class StubAiProvider implements IAiTextProvider {
  async translateText(_request: TranslateTextRequest): Promise<TranslateTextResult> {
    logger.warn("ai:provider-not-configured");
    throw new Error("No AI provider is configured");
  }
}

/** Same role as StubAiProvider, for image processing (Промпт №101). */
export class StubAiImageProvider implements IAiImageProvider {
  async removeBackground(_request: RemoveBackgroundRequest): Promise<RemoveBackgroundResult> {
    logger.warn("ai:image-provider-not-configured");
    throw new Error("No AI image provider is configured");
  }
}

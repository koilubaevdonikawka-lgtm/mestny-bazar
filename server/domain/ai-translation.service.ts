import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import { AiProviderError, InvalidTranslationRequestError } from "@server/domain/ai.errors";
import { logger } from "@shared/observability/logger";

/**
 * Universal AI text-translation orchestration (Промпт №088) — provider-
 * agnostic infrastructure, not yet wired into any feature (categories,
 * products, etc. stay untranslated by this service until a later prompt
 * explicitly asks for that). Depends only on IAiTextProvider (PL-03) — which
 * concrete provider answers a call is decided solely in
 * ai-provider.factory.ts.
 */
export class AiTranslationService {
  constructor(private readonly provider: IAiTextProvider) {}

  async translate(request: TranslateTextRequest): Promise<TranslateTextResult> {
    const text = request.text.trim();
    if (!text) {
      throw new InvalidTranslationRequestError("text must not be empty");
    }

    const targetLanguage = request.targetLanguage.trim();
    if (!targetLanguage) {
      throw new InvalidTranslationRequestError("targetLanguage must not be empty");
    }

    try {
      return await this.provider.translateText({ ...request, text, targetLanguage });
    } catch (error) {
      logger.error("ai:translate-failed", { targetLanguage, error });
      throw new AiProviderError("Failed to translate text");
    }
  }
}

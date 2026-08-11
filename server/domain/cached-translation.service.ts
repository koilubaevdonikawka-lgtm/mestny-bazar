import type {
  ITranslationCache,
  TranslationCacheEntry,
  TranslationCacheLookup,
} from "@server/ports/translation-cache.port";
import type { AiTranslationService } from "@server/domain/ai-translation.service";
import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";
import { logger } from "@shared/observability/logger";

/** Cache key language when the caller doesn't specify one (TranslateTextRequest.sourceLanguage is optional). */
const UNSPECIFIED_SOURCE_LANGUAGE = "auto";

/**
 * Wraps the existing, unmodified AiTranslationService with a persistent
 * cache lookup (Промпт №094) — composition, not modification: this class
 * depends on AiTranslationService as a collaborator, never changes its
 * code or contract. A cache hit returns the stored translation and never
 * calls the AI provider; a miss delegates to AiTranslationService exactly
 * as before, then stores the result for every future caller. The cache
 * layer is best-effort: a cache read/write failure never blocks a
 * translation from being returned, it just falls back to the AI call.
 */
export class CachedTranslationService {
  constructor(
    private readonly cache: ITranslationCache,
    private readonly translator: AiTranslationService,
  ) {}

  async translate(request: TranslateTextRequest): Promise<TranslateTextResult> {
    const lookup: TranslationCacheLookup = {
      sourceText: request.text,
      sourceLanguage: request.sourceLanguage ?? UNSPECIFIED_SOURCE_LANGUAGE,
      targetLanguage: request.targetLanguage,
    };

    const cached = await this.readCache(lookup);
    if (cached !== null) {
      return { translatedText: cached, detectedSourceLanguage: request.sourceLanguage ?? null };
    }

    const result = await this.translator.translate(request);
    await this.writeCache({ ...lookup, translatedText: result.translatedText });
    return result;
  }

  private async readCache(lookup: TranslationCacheLookup): Promise<string | null> {
    try {
      return await this.cache.get(lookup);
    } catch (error) {
      logger.error("translation-cache:read-failed", { error });
      return null;
    }
  }

  private async writeCache(entry: TranslationCacheEntry): Promise<void> {
    try {
      await this.cache.set(entry);
    } catch (error) {
      logger.error("translation-cache:write-failed", { error });
    }
  }
}

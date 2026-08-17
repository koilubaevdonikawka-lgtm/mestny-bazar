import { useQuery } from "@tanstack/react-query";
import { translatePublicText } from "@/api/translation";
import { DEFAULT_LANGUAGE, type Language } from "@/i18n/languages";

/**
 * Universal AI-translation hook (Промпт №095) — generalized from the
 * category-only useCategoryTranslations (Промпт №092) into one mechanism
 * reusable for any user-facing text: category names today, and product
 * names/descriptions, banner titles, the app name, or any other text
 * whenever a future prompt asks to translate them — no new translation
 * mechanism is introduced per content type. Every call goes through the
 * existing, unmodified CachedTranslationService (via the existing,
 * unmodified public translation API/AiTranslationService/GoogleAiAdapter/
 * AI Provider Factory) — a repeated text is never sent to Google AI twice.
 *
 * Keyed by the source text itself, not an entity id: content-addressed,
 * matching the same principle as the server-side cache key
 * (server/ports/translation-cache.port.ts) — different entities that share
 * the exact same source text correctly share one translation and one
 * lookup entry.
 */
export function useTranslatedTexts(texts: string[], language: Language): Record<string, string> {
  const uniqueTexts = [...new Set(texts.filter((text) => text.trim().length > 0))];
  const shouldTranslate = language !== DEFAULT_LANGUAGE && uniqueTexts.length > 0;

  const { data } = useQuery({
    queryKey: ["ai-translations", language, uniqueTexts],
    queryFn: async () => {
      const entries = await Promise.all(
        uniqueTexts.map(async (text) => {
          const result = await translatePublicText({
            text,
            targetLanguage: language,
            sourceLanguage: DEFAULT_LANGUAGE,
          });
          return [text, result.translatedText] as const;
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: shouldTranslate,
    staleTime: 60 * 60 * 1000,
  });

  return data ?? {};
}

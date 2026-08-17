/**
 * Universal AI text-translation contract (Промпт №088) — provider-agnostic
 * infrastructure. `targetLanguage`/`sourceLanguage` are free-form strings,
 * not an enum of the three UI languages in `src/i18n/languages.ts` (a
 * separate, unrelated system) — support for any language is a property of
 * whichever AI provider adapter is eventually registered, not of this
 * contract.
 */
export interface TranslateTextRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateTextResult {
  translatedText: string;
  detectedSourceLanguage: string | null;
}

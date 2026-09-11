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

/**
 * Задача №264 — Telegram bot's no-caption fallback: read whatever product
 * name is actually printed on the package in a photo. Provider-agnostic,
 * same as TranslateTextRequest — the caller supplies the exact instruction
 * so this contract doesn't hardcode a single prompt wording.
 */
export interface ReadImageTextRequest {
  imageData: Buffer;
  mimeType: string;
  instruction: string;
}

export interface ReadImageTextResult {
  /** Null — not empty string — when the provider found no clear text to read; never invented. */
  text: string | null;
}

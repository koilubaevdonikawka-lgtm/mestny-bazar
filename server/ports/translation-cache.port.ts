/**
 * Content-addressed lookup key: a translation is identified by its source
 * text and the language pair alone — never by a category/product id or any
 * other foreign reference (Промпт №094). This is what lets one cache serve
 * any content and any number of languages without new columns anywhere.
 */
export interface TranslationCacheLookup {
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationCacheEntry extends TranslationCacheLookup {
  translatedText: string;
}

export interface ITranslationCache {
  get(lookup: TranslationCacheLookup): Promise<string | null>;
  set(entry: TranslationCacheEntry): Promise<void>;
}

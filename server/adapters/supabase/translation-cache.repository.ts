import { createHash } from "node:crypto";
import type {
  ITranslationCache,
  TranslationCacheEntry,
  TranslationCacheLookup,
} from "@server/ports/translation-cache.port";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface TranslationCacheRow {
  translated_text: string;
}

/** Exported for testing — same technique already used for media dedup (media-metadata.service.ts). */
export function hashSourceText(sourceText: string): string {
  return createHash("sha256").update(sourceText).digest("hex");
}

/**
 * Content-addressed cache (Промпт №094): the lookup key is a hash of the
 * source text plus the language pair, never a category id or any other
 * foreign reference — works identically for categories, products, or any
 * future translated content, for any number of languages.
 */
export class SupabaseTranslationCache implements ITranslationCache {
  async get(lookup: TranslationCacheLookup): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from("translation_cache")
      .select("translated_text")
      .eq("source_text_hash", hashSourceText(lookup.sourceText))
      .eq("source_language", lookup.sourceLanguage)
      .eq("target_language", lookup.targetLanguage)
      .maybeSingle();

    if (error) throw new Error(`Failed to read translation cache: ${error.message}`);
    return (data as TranslationCacheRow | null)?.translated_text ?? null;
  }

  async set(entry: TranslationCacheEntry): Promise<void> {
    const { error } = await supabaseAdmin.from("translation_cache").upsert(
      {
        source_text_hash: hashSourceText(entry.sourceText),
        source_text: entry.sourceText,
        source_language: entry.sourceLanguage,
        target_language: entry.targetLanguage,
        translated_text: entry.translatedText,
      },
      { onConflict: "source_text_hash,source_language,target_language", ignoreDuplicates: true },
    );

    if (error) throw new Error(`Failed to write translation cache: ${error.message}`);
  }
}

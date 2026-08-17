/**
 * Supported UI languages (Промпт №100) — a single, scalable source: adding a
 * language is a one-line addition here (code + native label), nothing else.
 *
 * `ru`/`ky`/`en` are the three languages with their own static dictionary
 * under src/i18n/dictionaries/ (hand-authored UI chrome text). Every other
 * code below is drawn from Google's own documented list of languages "all
 * Gemini models" understand and respond in — no static dictionary exists or
 * is added for them; their UI chrome falls back to the English dictionary
 * (LanguageProvider.tsx), while all admin/seller-authored dynamic content
 * (categories, products, banners, app name) is translated for them through
 * the existing, unmodified AiTranslationService/CachedTranslationService —
 * the same mechanism already used for ky/en (useTranslatedTexts already
 * takes `language` as a plain string passed straight through as
 * `targetLanguage`, so no change was needed there for this to work).
 *
 * `ky` (Kyrgyz) is kept even though it is not in Google's documented Gemini
 * language list — it already has its own dictionary and is this app's
 * primary local-market language; that is unaffected by this expansion.
 *
 * `kk`/`uz`/`tg`/`tk` (Kazakh, Uzbek, Tajik, Turkmen — Промпт №100
 * addendum) are added the same way as `ky`: not in Google's documented
 * Gemini language list, no dictionary of their own, no special-cased
 * handling anywhere — same fallback-to-English static chrome, same
 * useTranslatedTexts → CachedTranslationService → AiTranslationService →
 * GoogleAiAdapter path as every other language on this list.
 */
export const SUPPORTED_LANGUAGES = [
  "ru",
  "ky",
  "kk",
  "uz",
  "tg",
  "tk",
  "en",
  "ar",
  "bn",
  "bg",
  "zh",
  "hr",
  "cs",
  "da",
  "nl",
  "et",
  "fi",
  "fr",
  "de",
  "el",
  "iw",
  "hi",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "lv",
  "lt",
  "no",
  "pl",
  "pt",
  "ro",
  "sr",
  "sk",
  "sl",
  "es",
  "sw",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "ru";

export const LANGUAGE_LABELS: Record<Language, string> = {
  ru: "Русский",
  ky: "Кыргызча",
  kk: "Қазақша",
  uz: "O‘zbekcha",
  tg: "Тоҷикӣ",
  tk: "Türkmençe",
  en: "English",
  ar: "العربية",
  bn: "বাংলা",
  bg: "Български",
  zh: "中文",
  hr: "Hrvatski",
  cs: "Čeština",
  da: "Dansk",
  nl: "Nederlands",
  et: "Eesti",
  fi: "Suomi",
  fr: "Français",
  de: "Deutsch",
  el: "Ελληνικά",
  iw: "עברית",
  hi: "हिन्दी",
  hu: "Magyar",
  id: "Bahasa Indonesia",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  lv: "Latviešu",
  lt: "Lietuvių",
  no: "Norsk",
  pl: "Polski",
  pt: "Português",
  ro: "Română",
  sr: "Српски",
  sk: "Slovenčina",
  sl: "Slovenščina",
  es: "Español",
  sw: "Kiswahili",
  sv: "Svenska",
  th: "ไทย",
  tr: "Türkçe",
  uk: "Українська",
  vi: "Tiếng Việt",
};

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  return !!value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

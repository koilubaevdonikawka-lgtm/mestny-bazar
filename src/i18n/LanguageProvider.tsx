import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_LANGUAGE, isSupportedLanguage, type Language } from "@/i18n/languages";
import { ru, type Dictionary } from "@/i18n/dictionaries/ru";
import { en } from "@/i18n/dictionaries/en";
import { ky } from "@/i18n/dictionaries/ky";
import { translate, type TranslationKey } from "@/i18n/t";

/**
 * Static UI-chrome dictionaries — only for the three languages that have
 * one (Промпт №100 deliberately does not add a dictionary per new Gemini
 * language, per its own rules). Every other supported language falls back
 * to `en` below for this static chrome text; their dynamic, admin-authored
 * content (categories/products/banners/app name) is still fully translated
 * via useTranslatedTexts → AiTranslationService, unaffected by this map.
 */
const dictionaries: Partial<Record<Language, Dictionary>> = { ru, ky, en };

const STORAGE_KEY = "mestny-bazar-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

/**
 * SSR always renders DEFAULT_LANGUAGE (Russian) — the persisted choice is
 * only known client-side (localStorage), so it's applied in an effect after
 * mount. This intentionally mirrors useCartSync/usePlatformNavigationGate's
 * existing "client state hydrates after first render" pattern in this
 * codebase, and avoids a hydration mismatch (the SSR-rendered markup and the
 * first client render are always identical: Russian).
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored !== DEFAULT_LANGUAGE) setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(dictionaries[language] ?? en, key, params),
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
}

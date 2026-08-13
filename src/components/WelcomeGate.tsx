import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { BRAND } from "@/config/brand";
import type { Language } from "@/i18n/languages";

/** Exported so AccountMenu's sign-out can clear it — the next person on a shared device sees WelcomeGate again. */
export const WELCOME_SEEN_KEY = "mestny-bazar-welcome-seen";

const QUICK_LANGUAGES: { code: Language; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "ky", label: "Кыргызча" },
  { code: "en", label: "English" },
];

/**
 * Единый экран входа/регистрации/выбора языка при первом визите — заменяет
 * прежние отдельные кнопки "Войти"/"Смена языка" во всегда видимом header
 * (убраны из SiteHeader/AccountMenu, см. их showAccountMenu/hideSignInButton
 * пропы). Показывается один раз на браузер/устройство (localStorage-флаг),
 * дальше не мешает — гость может продолжать без регистрации сколько угодно.
 *
 * Единственный реальный способ входа в этом приложении — Google OAuth
 * (signInWithGoogle); отдельной формы email/пароль в проекте нет. Supabase
 * автоматически создаёт аккаунт при первом OAuth-входе, поэтому кнопки
 * "Войти" и "Зарегистрироваться" запускают один и тот же поток — это
 * стандартный паттерн для OAuth-only приложений (Google сам решает,
 * новый это пользователь или нет), а не два разных механизма.
 */
export function WelcomeGate() {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(WELCOME_SEEN_KEY) !== "1") {
      setOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
    setOpen(false);
  }, []);

  // Fallback for a user who's already authenticated on mount (session
  // restored from a previous visit) without ever clicking through this
  // instance of the gate.
  useEffect(() => {
    if (isAuthenticated) dismiss();
  }, [isAuthenticated, dismiss]);

  // "Seen" must be recorded synchronously on click, not reactively once
  // isAuthenticated flips true — getAuthRedirectUrl() sends Google OAuth to
  // /workspace, not back to this page, so this component is unmounted by
  // the external navigation before it ever gets a chance to observe
  // isAuthenticated becoming true. Waiting for that flip is unreliable;
  // clicking either button unambiguously means onboarding is done with,
  // regardless of where the OAuth round trip eventually lands the user.
  const handleAuthClick = useCallback(() => {
    dismiss();
    void signInWithGoogle();
  }, [dismiss]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-3xl tracking-tight">«{BRAND.name}»</h1>
        <p className="mt-2 text-muted-foreground">{t("home.tagline")}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {QUICK_LANGUAGES.map(({ code, label }) => (
            <Button
              key={code}
              type="button"
              variant={language === code ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setLanguage(code)}
            >
              {label}
            </Button>
          ))}
          <LanguageSwitcher />
        </div>

        <div className="mt-8 grid gap-3">
          <Button size="lg" className="h-12 rounded-full" onClick={handleAuthClick}>
            {t("common.signIn")}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full"
            onClick={handleAuthClick}
          >
            {t("welcome.signUpButton")}
          </Button>
          <Button size="lg" variant="ghost" className="h-12 rounded-full" onClick={dismiss}>
            {t("welcome.continueAsGuestButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { BRAND } from "@/config/brand";
import { CUSTOMER_VISIBLE_LANGUAGES, LANGUAGE_LABELS } from "@/i18n/languages";

/** Exported so AccountMenu's sign-out can clear it — the next person on a shared device sees WelcomeGate again. */
export const WELCOME_SEEN_KEY = "mestny-bazar-welcome-seen";

/**
 * Единый экран входа/регистрации/выбора языка при первом визите — заменяет
 * прежние отдельные кнопки "Войти"/"Смена языка" во всегда видимом header
 * (убраны из SiteHeader/AccountMenu, см. их showAccountMenu/hideSignInButton
 * пропы). Показывается один раз на браузер/устройство (localStorage-флаг),
 * дальше не мешает — гость может продолжать без регистрации сколько угодно.
 *
 * Задача №305 — "Войти" и "Зарегистрироваться" both expand, in place of
 * themselves, into SignInMethodsList (src/components/auth/SignInMethodsList.tsx)
 * — the same shared list AccountMenu/addresses.tsx/RegisterPromptDialog
 * already use (Google OAuth + the Telegram Login Widget). No separate
 * email/password form exists anywhere in this app, and both methods create
 * the account on first use, so the two buttons genuinely are the same
 * action — kept as two labels because a first-time visitor doesn't yet know
 * that, not because they lead anywhere different.
 */
export function WelcomeGate() {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const [open, setOpen] = useState(false);
  const [showSignInMethods, setShowSignInMethods] = useState(false);

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

  // Задача №305 — "seen" is still recorded synchronously on click (not
  // reactively once isAuthenticated flips true — Google's OAuth redirect
  // unmounts this component before it could ever observe that flip, same
  // reasoning the previous handleAuthClick already relied on), but the
  // overlay itself must NOT close yet: unlike the old single Google button,
  // opening SignInMethodsList here still needs to stay on screen so the
  // buyer can actually see and use the Telegram widget inside it. Only
  // marks "seen" — visibility is separate now, see handleActionSelected
  // and the Telegram widget's own natural full-page redirect on success
  // below.
  const handleOpenSignIn = useCallback(() => {
    window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
    setShowSignInMethods(true);
  }, []);

  // Google's own SignInMethodsList entry redirects the whole page almost
  // immediately (signInWithOAuth) — closing the overlay right away (not
  // waiting for that navigation) matches the exact old handleAuthClick
  // behavior. Telegram deliberately does NOT go through this: it's a
  // "widget" list entry, not an "action" one, so SignInMethodsList never
  // calls this for it — the overlay must stay open while the widget's own
  // "Входим…" state and any retry-after-failure happens in place, closing
  // only via a full-page redirect on real success (signInWithTelegram's
  // own window.location.href) or the buyer choosing "Продолжить без
  // регистрации" below.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-background p-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-3xl tracking-tight">«{BRAND.name}»</h1>
        <p className="mt-2 text-muted-foreground">{t("home.tagline")}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {CUSTOMER_VISIBLE_LANGUAGES.map((code) => (
            <Button
              key={code}
              type="button"
              variant={language === code ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setLanguage(code)}
            >
              {LANGUAGE_LABELS[code]}
            </Button>
          ))}
        </div>

        <div className="mt-8 grid gap-3">
          {showSignInMethods ? (
            <SignInMethodsList onActionSelected={dismiss} />
          ) : (
            <>
              <Button size="lg" className="h-12 rounded-full" onClick={handleOpenSignIn}>
                {t("common.signIn")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full"
                onClick={handleOpenSignIn}
              >
                {t("welcome.signUpButton")}
              </Button>
            </>
          )}
          <Button size="lg" variant="ghost" className="h-12 rounded-full" onClick={dismiss}>
            {t("welcome.continueAsGuestButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

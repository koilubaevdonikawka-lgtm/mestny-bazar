import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { BRAND } from "@/config/brand";
import { CUSTOMER_VISIBLE_LANGUAGES, LANGUAGE_LABELS } from "@/i18n/languages";

/** Exported so AccountMenu's sign-out can clear it — the next person on a shared device sees WelcomeGate again. */
export const WELCOME_SEEN_KEY = "mestny-bazar-welcome-seen";

/**
 * Единый экран входа/регистрации/выбора языка — заменяет прежние отдельные
 * кнопки "Войти"/"Смена языка" во всегда видимом header (убраны из
 * SiteHeader/AccountMenu, см. их showAccountMenu/hideSignInButton пропы).
 *
 * Задача №308 — вход обязателен: "Продолжить без регистрации" убрана
 * совсем, и экран больше не закрывается по одному лишь клику "Войти"/
 * "Зарегистрироваться" — единственный способ его закрыть теперь
 * подтверждённая сессия (isAuthenticated становится true). До этой задачи
 * WELCOME_SEEN_KEY отмечался сразу по клику (до того, как OAuth/Telegram
 * реально завершались) — тогда это было осознанно (гость мог продолжить
 * и так, поэтому не имело значения, довёл ли он вход до конца). Теперь
 * это было бы дырой: отменённый/неудавшийся Google-вход или Telegram-
 * попытка молча "засчитывались" бы как «уже видел» и пропускали бы
 * человека без входа при следующем визите. Флаг теперь выставляется
 * только в одном месте — реактивно, когда isAuthenticated действительно
 * стал true.
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

  // Задача №308 — the one and only place this closes the gate: a real,
  // confirmed Supabase session. Covers both a user already authenticated
  // on mount (session restored from a previous visit, never clicked
  // through this instance) and a fresh sign-in completing while the gate
  // is open. A cancelled/failed Google redirect or a failed Telegram
  // attempt leaves isAuthenticated false, so the gate simply stays open —
  // exactly the point of making sign-in mandatory.
  useEffect(() => {
    if (isAuthenticated) {
      window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
      setOpen(false);
    }
  }, [isAuthenticated]);

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
            <SignInMethodsList />
          ) : (
            <>
              <Button
                size="lg"
                className="h-12 rounded-full"
                onClick={() => setShowSignInMethods(true)}
              >
                {t("common.signIn")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full"
                onClick={() => setShowSignInMethods(true)}
              >
                {t("welcome.signUpButton")}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

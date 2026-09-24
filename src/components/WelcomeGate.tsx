import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { BRAND } from "@/config/brand";
import { CUSTOMER_VISIBLE_LANGUAGES, LANGUAGE_LABELS } from "@/i18n/languages";

/** Exported so AccountMenu's sign-out can clear it — the next person on a shared device sees WelcomeGate again. */
export const WELCOME_SEEN_KEY = "mestny-bazar-welcome-seen";

/**
 * Задача №309 — every route prefix that has its own separate sign-in and
 * its own beforeLoad access barrier (admin.tsx/warehouse.tsx/courier.tsx/
 * seller.tsx), plus /bootstrap (pre-Operational owner-claim, no "customer"
 * concept yet) and /workspace (the post-login role picker — only ever
 * reached by an already-authenticated account, so the gate would already
 * be closed there anyway; excluded explicitly rather than relying on that
 * timing). This mandatory-sign-in gate is a customer-storefront concern
 * only — mounting it globally in __root.tsx must not paint it, even
 * briefly, over a staff member's own screen while their session is still
 * resolving.
 */
const STAFF_OR_SYSTEM_ROUTE_PREFIXES = [
  "/admin",
  "/warehouse",
  "/courier",
  "/seller",
  "/bootstrap",
  "/workspace",
];

function isStaffOrSystemRoute(pathname: string): boolean {
  return STAFF_OR_SYSTEM_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Единый экран входа/регистрации/выбора языка — заменяет прежние отдельные
 * кнопки "Войти"/"Смена языка" во всегда видимом header (убраны из
 * SiteHeader/AccountMenu, см. их showAccountMenu/hideSignInButton пропы).
 *
 * Задача №309 — mounted once in __root.tsx (was index.tsx-only before —
 * every other customer route, product/category/cart/profile/..., had no
 * gate at all and a signed-out visitor could browse them freely). Renders
 * for every route except the staff/system prefixes above; those keep their
 * own separate sign-in untouched.
 *
 * Реактивность теперь в обе стороны: не только закрывается при успешном
 * входе, но и открывается заново сразу, как только isAuthenticated
 * становится false — истёкшая сессия или выход в другой вкладке
 * (usePlatformNavigationGate: тот же supabase.auth.onAuthStateChange, уже
 * реактивный без перезагрузки) показывают экран поверх ТЕКУЩЕЙ страницы,
 * не перебрасывая на "/": ничего здесь не вызывает navigate().
 *
 * Задача №308 — вход обязателен: "Продолжить без регистрации" убрана
 * совсем, и экран больше не закрывается по одному лишь клику "Войти"/
 * "Зарегистрироваться" — единственный способ его закрыть теперь
 * подтверждённая сессия (isAuthenticated становится true). WELCOME_SEEN_KEY
 * выставляется/снимается только реактивно, вместе с isAuthenticated —
 * никогда по одному лишь клику.
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
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showSignInMethods, setShowSignInMethods] = useState(false);

  // Optimistic initial guess from the flag, purely so a never-signed-in
  // visitor (or one who just signed out — AccountMenu's handleSignOut
  // already clears this flag synchronously) sees the gate immediately
  // instead of the real page flashing open while isAuthenticated (async)
  // is still resolving from `null`. Re-evaluated for real below the
  // instant isAuthenticated settles either way.
  useEffect(() => {
    if (window.localStorage.getItem(WELCOME_SEEN_KEY) !== "1") {
      setOpen(true);
    }
  }, []);

  // Задача №308/№309 — the one real source of truth, reactive both ways:
  // isAuthenticated true closes the gate and marks "seen"; isAuthenticated
  // false (a session ending for ANY reason — explicit sign-out, expiry,
  // signed out in another tab, all surfaced the same way by
  // useSupabaseSession's onAuthStateChange subscription) reopens it and
  // clears "seen", right on whatever page the visitor is already looking
  // at — no redirect, no reload. `null` (initial check still in flight) is
  // deliberately left alone so it never overrides the optimistic guess
  // above with a premature "definitely signed out".
  useEffect(() => {
    if (isAuthenticated === null) return;
    if (isAuthenticated) {
      window.localStorage.setItem(WELCOME_SEEN_KEY, "1");
      setOpen(false);
    } else {
      window.localStorage.removeItem(WELCOME_SEEN_KEY);
      setOpen(true);
    }
  }, [isAuthenticated]);

  if (!open || isStaffOrSystemRoute(location.pathname)) return null;

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

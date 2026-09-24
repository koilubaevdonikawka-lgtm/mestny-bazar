import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { BRAND } from "@/config/brand";
import { LANGUAGE_LABELS, type Language } from "@/i18n/languages";

/** Exported so AccountMenu's sign-out can clear it — the next person on a shared device sees WelcomeGate again. */
export const WELCOME_SEEN_KEY = "mestny-bazar-welcome-seen";

/**
 * Welcome-screen-only language order (Кыргызча, Русский, English, 中文) —
 * deliberately a separate list from CUSTOMER_VISIBLE_LANGUAGES rather than
 * reordering that shared source, because LanguageSwitcher (the header's own
 * language menu, src/components/shared/LanguageSwitcher.tsx) maps over that
 * same array too; reordering it here would have silently reordered the
 * header menu as well, which was explicitly out of scope for this change.
 * `satisfies readonly Language[]` only guarantees each code is a valid
 * language, not that this stays a permutation of CUSTOMER_VISIBLE_LANGUAGES —
 * if that shared list ever gains/drops a customer-facing language, this
 * welcome-screen order needs a matching manual update.
 */
const WELCOME_LANGUAGE_ORDER = ["ky", "ru", "en", "zh"] as const satisfies readonly Language[];

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
 * Задача №310 — SignInMethodsList (src/components/auth/SignInMethodsList.tsx,
 * the same shared list AccountMenu/addresses.tsx/RegisterPromptDialog use)
 * renders immediately under a "Войдите, чтобы продолжить" heading — no
 * intermediate "Войти"/"Зарегистрироваться" click first (Задача №305's
 * expand-in-place step). Those two buttons were removed rather than kept
 * as decoration: sign-in is the ONLY action this screen offers (Задача
 * №308), both methods create the account on first use, and both buttons
 * already led to the identical list — with the methods themselves visible,
 * they'd just be two more same-looking buttons stacked above the real
 * ones. Only this screen changed; the other three call sites keep their
 * click-to-expand. The list is a vertical stack (its own default layout),
 * inside this overlay's overflow-y-auto container, so a future third
 * method (WhatsApp) adds one more row here with no layout change.
 */
export function WelcomeGate() {
  const { t, language, setLanguage } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const location = useLocation();
  const [open, setOpen] = useState(false);

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
          {WELCOME_LANGUAGE_ORDER.map((code) => (
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

        <div className="mt-8">
          <h2 className="text-lg font-medium">{t("auth.signInPrompt")}</h2>
          <SignInMethodsList className="mt-4 flex flex-col items-stretch gap-3" />
        </div>
      </div>
    </div>
  );
}

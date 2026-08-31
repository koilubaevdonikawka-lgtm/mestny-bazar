import type { ReactNode } from "react";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import { AccountMenu } from "./AccountMenu";
import { SearchBar } from "./SearchBar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { isNativePlatform } from "@/lib/capabilities/platform";

interface SiteHeaderProps {
  /**
   * Opt-in only — defaults to false so every existing caller (admin, seller,
   * courier panels) keeps its exact current header, unchanged. Only the
   * customer-facing shopping pages pass `true`.
   */
  showLanguageSwitcher?: boolean;
  /**
   * Search and cart default to `true` (existing universal behavior for every
   * current caller) — unlike showLanguageSwitcher, these are opt-**out**,
   * not opt-in, so no customer-facing call site needs to change. Only the
   * Admin Platform passes `false`: search is bound to the buyer catalog's
   * useSearchStore and cart is buyer-checkout-only — neither has any
   * meaning inside the admin panel (docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md).
   */
  showSearch?: boolean;
  showCart?: boolean;
  /**
   * Задача №175 — the home page ("/") is the root of navigation: there is
   * nothing above it to go "back" to, and the previous behavior
   * (history.back() when in-app history exists, else a no-op navigate to
   * "/") never actually left the page. Opt-out (default true) so every
   * other existing caller keeps its current back button unchanged — only
   * the home route passes `false`.
   *
   * Задача №213 — independent of `showSearch` for every caller, not just the
   * home page: the two used to be accidentally coupled (`showSearch &&
   * showBackButton`), which meant every caller that hid the search bar
   * (Admin Platform, courier panel, several customer pages) silently lost
   * the header's back button too, with no way to have one without the
   * other. A caller that already renders its own dedicated back-navigation
   * chrome elsewhere (e.g. AdminLayout's `leftSlot`, `search.tsx`'s own
   * inline Назад/Домой row) must now pass `showBackButton={false}` itself to
   * avoid showing two.
   */
  showBackButton?: boolean;
  /**
   * Adds safe-area top padding for the native/Capacitor shell (status bar /
   * notch). Zero-effect on regular desktop/web (env() resolves to 0), but
   * kept opt-in — same reasoning as showLanguageSwitcher — so admin/seller/
   * courier headers stay byte-for-byte unchanged.
   */
  safeAreaTop?: boolean;
  /**
   * Hides AccountMenu's "Войти" call-to-action for signed-out visitors —
   * sign-in is now offered once via WelcomeGate on first visit instead of a
   * permanent header button (Часть 2). Opt-in so admin/seller/courier pages
   * sharing this same header keep their existing behavior untouched.
   */
  hideSignInButton?: boolean;
  /**
   * Fully hides AccountMenu — both the signed-out "Войти" CTA and the
   * signed-in avatar/dropdown (no person-silhouette icon at all, regardless
   * of auth state — every customer-facing page passes this now, per the
   * comprehensive user panel task). Opt-out (default true), so any
   * non-customer caller keeps its icon.
   */
  showAccountMenu?: boolean;
  /**
   * Срочная проверка (мобильный вход) — every customer page hides
   * AccountMenu (above) on the assumption that BottomTabBar's "Профиль" tab
   * is the mobile equivalent, but that tab bar is native-only
   * (isNativePlatform() gate in __root.tsx) and never renders on web, mobile
   * or desktop. That left signed-out web visitors with no visible sign-in
   * path on pages that don't already show one of their own (ProfilePage's
   * own centered CTA, checkout.quick-buy's inline "deliver-to" CTA, a
   * non-empty CartPanel's own CTA) — just a one-time WelcomeGate on first
   * visit. Opt-in (default false) and explicitly set only on the browsing
   * pages confirmed to have no sign-in CTA of their own, specifically to
   * avoid ever showing two "Войти" prompts on one screen. No-op on native
   * (BottomTabBar's "Профиль" tab already covers it there) and once already
   * signed in.
   */
  showSignInFallback?: boolean;
  /**
   * Задача №198 — rendered in the same top-left slot the search bar
   * occupies, in its place, when `showSearch` is false. Lets a caller like
   * AdminLayout put its own chrome (Назад/На главную) exactly where the
   * search bar used to be, instead of a separate row below the header.
   * Ignored while `showSearch` is true.
   */
  leftSlot?: ReactNode;
}

export function SiteHeader({
  showLanguageSwitcher = false,
  showSearch = true,
  showCart = true,
  showBackButton = true,
  safeAreaTop = false,
  hideSignInButton = false,
  showAccountMenu = true,
  showSignInFallback = false,
  leftSlot,
}: SiteHeaderProps = {}) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
  // Срочная проверка (мобильный вход) — only read when it's actually needed;
  // see the fallback CTA below and its doc comment on showSignInFallback.
  const { isAuthenticated } = useSupabaseSession();
  const showWebSignInFallback =
    showSignInFallback && isAuthenticated === false && !isNativePlatform();

  // Задача №1 — standard "← Назад" replacing the previous Home-icon button:
  // real back navigation when there's an in-app previous screen to return
  // to (true history.back(), not just a link to "/"), falling back to the
  // home page only when there's nothing to go back to (direct/external
  // entry). Same pattern already used on the product page (Этап №7/8).
  const canGoBack = useCanGoBack();

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60 ${safeAreaTop ? "pt-safe" : ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Этап №7 навигационного аудита — the only site-wide, always-visible
            way back on mobile (nav below is `lg:` only).
            Задача №213 — independent of `showSearch` (that flag now controls
            only the search bar/leftSlot, per its own doc comment): a caller
            that wants the search bar hidden does not thereby also want the
            back button hidden — that was an accidental coupling, not a
            deliberate design. Gated only on `showBackButton` (Задача №175),
            false only on the home page, which has nothing to go back to; a
            caller with its own dedicated back-navigation chrome (e.g.
            AdminLayout's `leftSlot`) opts out explicitly via
            `showBackButton={false}` to avoid showing two. */}
        {showBackButton && (
          <button
            type="button"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                void navigate({ to: "/" });
              }
            }}
            aria-label={t("common.back")}
            className="flex h-11 shrink-0 items-center gap-1 rounded-full px-2 text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("common.back")}</span>
          </button>
        )}
        {/* flex-1 spacer kept even when search is hidden (Admin Platform) — it's
            what pushes nav/account/cart to the right; only its contents are
            conditional, so hiding search doesn't collapse the header layout.
            Задача №225 — showLanguageSwitcher now renders right next to the
            search field (only when search itself is shown) instead of the
            header's right-hand cluster: min-w-0 on the search wrapper lets
            it shrink below its own content width on narrow screens (a flex
            item won't shrink past that by default), while shrink-0 on the
            switcher keeps it from ever getting squeezed out. */}
        <div className="flex flex-1 max-w-xl items-center gap-2">
          {showSearch ? (
            <>
              <div className="relative min-w-0 flex-1">
                <SearchBar />
              </div>
              {showLanguageSwitcher && (
                <div className="shrink-0">
                  <LanguageSwitcher />
                </div>
              )}
            </>
          ) : (
            leftSlot
          )}
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <a href="#categories" className="hover:text-primary transition-colors">
            {t("nav.categories")}
          </a>
          <a href="#products" className="hover:text-primary transition-colors">
            {t("home.productsHeading")}
          </a>
          <a href="#delivery" className="hover:text-primary transition-colors">
            {t("header.deliveryLink")}
          </a>
        </nav>
        {showAccountMenu && <AccountMenu hideSignInCta={hideSignInButton} />}
        {/* Срочная проверка (мобильный вход) — restores a "Войти" entry
            point on web (mobile and desktop) for pages that hide the full
            AccountMenu; see the doc comment on showAccountMenu above. */}
        {showWebSignInFallback && (
          <Button
            variant="outline"
            className="h-11 rounded-full px-4"
            onClick={() => void signInWithGoogle()}
          >
            {t("common.signIn")}
          </Button>
        )}
        {/* Задача №177/178 — the "i" info/contacts dialog that used to live
            here (customer pages only, via the now-removed cartIconOnly flag)
            moved to its own full-screen route (/info), linked from
            BottomTabBar's "Информация" tab, instead of being duplicated in
            two places. */}
        {showCart && <CartDrawer />}
      </div>
    </header>
  );
}

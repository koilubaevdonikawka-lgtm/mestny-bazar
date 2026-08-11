import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { CartDrawer } from "./CartDrawer";
import { AccountMenu } from "./AccountMenu";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useSearchStore } from "@/stores/searchStore";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageProvider";

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
   * Adds safe-area top padding for the native/Capacitor shell (status bar /
   * notch). Zero-effect on regular desktop/web (env() resolves to 0), but
   * kept opt-in — same reasoning as showLanguageSwitcher — so admin/seller/
   * courier headers stay byte-for-byte unchanged.
   */
  safeAreaTop?: boolean;
}

export function SiteHeader({
  showLanguageSwitcher = false,
  showSearch = true,
  showCart = true,
  safeAreaTop = false,
}: SiteHeaderProps = {}) {
  const { search, setSearch } = useSearchStore();
  const { t } = useTranslation();
  const router = useRouter();
  const navigate = useNavigate();
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
            way back on mobile (nav below is `lg:` only). Gated on the same
            `showSearch` flag as the rest of this customer-storefront chrome,
            so Admin Platform pages that already opt out of it
            (`showSearch={false}`) don't get it either. */}
        {showSearch && (
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
            conditional, so hiding search doesn't collapse the header layout. */}
        <div className="relative flex-1 max-w-xl">
          {showSearch && (
            <>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                inputMode="search"
                placeholder={t("header.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-full pl-11 pr-5"
                aria-label={t("header.searchPlaceholder")}
              />
            </>
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
        {showLanguageSwitcher && <LanguageSwitcher />}
        <AccountMenu />
        {showCart && <CartDrawer />}
      </div>
    </header>
  );
}

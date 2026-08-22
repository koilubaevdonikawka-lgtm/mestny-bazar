import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useTranslation } from "@/i18n/LanguageProvider";

/** Height reserved via __root.tsx's content padding must match this bar's
 * actual rendered height (icon + label + vertical padding), so page content
 * (e.g. the last card in a list, CartPanel/SubcategoryGrid's own footer)
 * never sits underneath the fixed bar. Kept as one constant both places
 * read, so they can't silently drift apart. */
export const BOTTOM_TAB_BAR_HEIGHT_REM = 4;

interface TabConfig {
  to: "/" | "/catalog" | "/cart" | "/profile";
  label: string;
  Icon: typeof Home;
}

/**
 * Native-only persistent bottom navigation (Главная/Каталог/Корзина/Профиль)
 * — mounted globally in __root.tsx, gated on isNativePlatform() there, not
 * inside this component; on web this file is simply never rendered. Active
 * tab highlighted from the real current route (useLocation, reactive —
 * unlike useAndroidBackButton's router ref-workaround, this is meant to
 * re-render on every navigation). Cart badge reuses useCartStore exactly
 * like SiteHeader/CartDrawer already do — same reactive count, no new
 * source of truth. Icons match the existing visual language elsewhere in
 * the app: ShoppingCart (CartDrawer/CartPanel), User (AccountMenu's own
 * avatar trigger) — Home/LayoutGrid are the natural lucide-react
 * equivalents for the two tabs with no prior dedicated icon.
 */
export function BottomTabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const tabs: TabConfig[] = [
    { to: "/", label: "Главная", Icon: Home },
    { to: "/catalog", label: t("nav.catalog"), Icon: LayoutGrid },
    { to: "/cart", label: t("nav.cart"), Icon: ShoppingCart },
    { to: "/profile", label: t("nav.profile"), Icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md pb-safe"
      style={{ height: `calc(${BOTTOM_TAB_BAR_HEIGHT_REM}rem + env(safe-area-inset-bottom))` }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-stretch justify-around">
        {tabs.map(({ to, label, Icon }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {to === "/cart" && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium leading-none text-destructive-foreground">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

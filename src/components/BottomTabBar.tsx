import { Link, useLocation } from "@tanstack/react-router";
import { Home, Info, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useTranslation } from "@/i18n/LanguageProvider";

/** Height reserved via __root.tsx's content padding must match this bar's
 * actual rendered height (icon + label + vertical padding), so page content
 * (e.g. the last card in a list, CartPanel/SubcategoryGrid's own footer)
 * never sits underneath the fixed bar. Kept as one constant both places
 * read, so they can't silently drift apart. */
export const BOTTOM_TAB_BAR_HEIGHT_REM = 4;

interface RouteTab {
  to: "/" | "/info" | "/cart" | "/profile";
  label: string;
  Icon: typeof Home;
}

// min-w-0 + truncate: with a large Android system font or a narrow viewport
// (Display size) the four tabs' min-content width exceeded the screen and the
// last one ("Профиль") was pushed past the right edge of the fixed bar —
// labels now shrink with an ellipsis instead. leading-tight (not -none) so
// truncate's overflow:hidden doesn't clip descenders like "ф".
const TAB_ITEM_CLASS = "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5";
const TAB_LABEL_CLASS = "max-w-full truncate text-[11px] font-medium leading-tight";

/**
 * Native-only persistent bottom navigation (Главная/Информация/Корзина/
 * Профиль) — mounted globally in __root.tsx, gated on isNativePlatform()
 * there, not inside this component; on web this file is simply never
 * rendered. Active tab highlighted from the real current route (useLocation,
 * reactive — unlike useAndroidBackButton's router ref-workaround, this is
 * meant to re-render on every navigation). Cart badge reuses useCartStore
 * exactly like SiteHeader/CartDrawer already do — same reactive count, no
 * new source of truth.
 *
 * Задача №177 — "Каталог" replaced with "Информация": the home page's own
 * category/subcategory browser plus /search already cover full catalog
 * access without this tab, and a standalone /catalog route still exists at
 * its own URL for anyone who lands on it directly — nothing became
 * unreachable by dropping it from this bar.
 *
 * Задача №178 — "Информация" is a real route (/info, same content SiteHeader's
 * "i" icon used to open as a dialog, before Задача №177 moved it here as a
 * dialog too) rather than a dialog trigger, specifically so it's a normal
 * `renderRouteTab` like the other three and gets the exact same active/green
 * pill treatment when the user is actually on that page — a dialog has no
 * location.pathname of its own for this check to ever see as "current".
 */
export function BottomTabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function renderRouteTab({ to, label, Icon }: RouteTab) {
    const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
    return (
      <Link key={to} to={to} className={TAB_ITEM_CLASS}>
        {/* Уточнение к Задаче №177 — активная вкладка красится сплошным
            зелёным фоном целиком (не только иконка/текст), по аналогии с
            активной кнопкой-пилюлей категории на главной странице
            (rounded-full bg-primary text-primary-foreground). */}
        <span
          className={`flex max-w-full min-w-0 flex-col items-center gap-0.5 rounded-full px-2.5 py-1.5 transition-colors ${
            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
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
          <span className={TAB_LABEL_CLASS}>{label}</span>
        </span>
      </Link>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md pb-safe"
      style={{ height: `calc(${BOTTOM_TAB_BAR_HEIGHT_REM}rem + env(safe-area-inset-bottom))` }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-stretch justify-around">
        {renderRouteTab({ to: "/", label: "Главная", Icon: Home })}
        {renderRouteTab({ to: "/info", label: t("nav.info"), Icon: Info })}
        {renderRouteTab({ to: "/cart", label: t("nav.cart"), Icon: ShoppingCart })}
        {renderRouteTab({ to: "/profile", label: t("nav.profile"), Icon: User })}
      </div>
    </nav>
  );
}

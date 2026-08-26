import { Link, useLocation } from "@tanstack/react-router";
import { Home, Info, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useTranslation } from "@/i18n/LanguageProvider";
import { AppInfoDialog } from "@/components/AppInfoDialog";

/** Height reserved via __root.tsx's content padding must match this bar's
 * actual rendered height (icon + label + vertical padding), so page content
 * (e.g. the last card in a list, CartPanel/SubcategoryGrid's own footer)
 * never sits underneath the fixed bar. Kept as one constant both places
 * read, so they can't silently drift apart. */
export const BOTTOM_TAB_BAR_HEIGHT_REM = 4;

interface RouteTab {
  to: "/" | "/cart" | "/profile";
  label: string;
  Icon: typeof Home;
}

const TAB_ITEM_CLASS = "relative flex flex-1 flex-col items-center justify-center gap-0.5";
const TAB_LABEL_CLASS = "text-[11px] font-medium leading-none";

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
 * Задача №177 — "Каталог" replaced with "Информация" (same dialog SiteHeader's
 * "i" icon used to open there — that icon is now removed, no longer
 * duplicated): the home page's own category/subcategory browser plus
 * /search already cover full catalog access without this tab, and a
 * standalone /catalog route still exists at its own URL for anyone who
 * lands on it directly — nothing became unreachable by dropping it from
 * this bar. "Информация" doesn't navigate (it opens a dialog in place), so
 * unlike the three route tabs it never gets the active/green treatment.
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
          className={`flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-colors ${
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
        <AppInfoDialog
          trigger={
            <button type="button" className={`${TAB_ITEM_CLASS} text-muted-foreground`}>
              <Info className="h-5 w-5" />
              <span className={TAB_LABEL_CLASS}>{t("nav.info")}</span>
            </button>
          }
        />
        {renderRouteTab({ to: "/cart", label: t("nav.cart"), Icon: ShoppingCart })}
        {renderRouteTab({ to: "/profile", label: t("nav.profile"), Icon: User })}
      </div>
    </nav>
  );
}

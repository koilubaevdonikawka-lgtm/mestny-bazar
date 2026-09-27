import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CartPanel } from "@/components/CartPanel";
import { useCartStore } from "@/stores/cartStore";
import { useTranslation } from "@/i18n/LanguageProvider";
import { BRAND } from "@/config/brand";

/**
 * First step toward the mobile bottom-tab-bar navigation
 * (Главная/Каталог/Корзина/Профиль) — a real, standalone /cart route
 * showing the exact same content/logic CartDrawer's Sheet already shows,
 * via the shared CartPanel component (extracted this task, no business
 * logic rewritten). The header's cart icon still opens the Sheet as
 * before — this page is a second, additional entry point for now, not a
 * replacement; swapping the header trigger for real tab-bar navigation is
 * a separate, later step.
 */
export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function CartPage() {
  const { t } = useTranslation();
  const { items } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Задача №187 — no search bar on the cart page itself; nothing here
          benefits from an in-place product search, and it just adds visual
          clutter above the checkout flow. */}
      {/* showSignInFallback only while the cart is empty — once it has
          items, CartPanel's own "Войти" prompt (readiness.isAuthenticated
          section) already covers sign-in, and showing both would duplicate
          the CTA on one screen. */}
      <SiteHeader
        safeAreaTop
        showAccountMenu={false}
        showCart={false}
        showSearch={false}
        showSignInFallback={totalItems === 0}
      />
      <main className="flex-1 mx-auto max-w-lg w-full px-4 py-6 sm:px-6 flex flex-col">
        {/* Empty cart: no page heading — CartPanel's own empty state (icon,
            "Корзина пуста", description, catalog CTA) already says it all,
            and a heading above it just repeated the same description. */}
        {totalItems > 0 && (
          <>
            <h1 className="font-serif text-2xl tracking-tight">{t("cart.yourCartTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(totalItems === 1 ? "cart.itemsInCartOne" : "cart.itemsInCartMany", {
                count: totalItems,
              })}
            </p>
          </>
        )}
        <CartPanel active />
      </main>
    </div>
  );
}

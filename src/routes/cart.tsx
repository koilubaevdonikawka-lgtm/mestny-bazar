import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 mx-auto max-w-lg w-full px-4 py-6 sm:px-6 flex flex-col">
        <h1 className="font-serif text-2xl tracking-tight">{t("cart.yourCartTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalItems === 0
            ? t("cart.emptyDescription")
            : t(totalItems === 1 ? "cart.itemsInCartOne" : "cart.itemsInCartMany", {
                count: totalItems,
              })}
        </p>
        <CartPanel active />
      </main>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, CreditCard, Loader2, Package } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCatalogProduct } from "@/lib/catalog";
import { listDeliveryZones } from "@/api/delivery-zone";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { BRAND } from "@/config/brand";
import type { PaymentMethod } from "@shared/contracts/order";

/**
 * Часть 6 задачи "КОМПЛЕКСНАЯ ОПТИМИЗАЦИЯ" — отдельная страница оплаты для
 * "Купить в один клик" (вместо создания заказа прямо со страницы товара).
 * Товар и количество передаются через search params, а не route context —
 * страница должна открываться по прямому URL (deep-link) точно так же, как
 * при обычной навигации со страницы товара.
 */
// productSlug/quantity have no sensible default (there's no "default
// product") — `.catch(undefined)` per field keeps validateSearch itself
// from ever throwing (a throw there surfaces as a raw server error, not a
// normal in-app page); QuickBuyPage checks for the missing/invalid case
// itself and renders a friendly fallback instead. Every real visit (via
// the "Купить в один клик" button) always supplies both params — this only
// guards a direct/malformed URL, not the golden path.
const quickBuySearchSchema = z.object({
  productSlug: z.string().min(1).optional().catch(undefined),
  quantity: z.number().int().positive().optional().catch(undefined),
});

export const Route = createFileRoute("/checkout/quick-buy")({
  component: QuickBuyPage,
  validateSearch: quickBuySearchSchema,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function QuickBuyPage() {
  const { productSlug, quantity } = Route.useSearch();
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", productSlug ?? ""],
    queryFn: () => fetchCatalogProduct(productSlug!),
    retry: false,
    enabled: !!productSlug && !!quantity,
  });

  const { address, zoneId, customerPhone, setAddress, setZoneId, setCustomerPhone } =
    useCheckoutStore();
  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });
  const { submitOrder, isSubmitting } = useCreateOrder();
  const [submittingMethod, setSubmittingMethod] = useState<PaymentMethod | null>(null);

  const translations = useTranslatedTexts([product?.title ?? ""], language);
  const displayTitle = product ? (translations[product.title] ?? product.title) : "";

  // Прямая/испорченная ссылка без обоих параметров — единственный реальный
  // путь на эту страницу (кнопка "Купить в один клик") всегда передаёт оба.
  // Ранний return здесь же сужает тип productSlug/quantity до string/number
  // для остального тела компонента (goBackToProduct/handlePay/JSX ниже).
  if (!productSlug || !quantity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="font-serif text-2xl">{t("product.notFoundTitle")}</h2>
          <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
            <Link to="/">{t("common.home")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const goBackToProduct = () => {
    void navigate({ to: "/product/$handle", params: { handle: productSlug } });
  };

  const handlePay = async (method: PaymentMethod) => {
    if (!product) return;
    // Синхронная запись в store перед отправкой — useCreateOrder читает
    // paymentMethod через getState() в момент вызова, поэтому видит именно
    // это значение, а не устаревшее из предыдущего рендера.
    useCheckoutStore.getState().setPaymentMethod(method);
    setSubmittingMethod(method);
    await submitOrder([
      {
        productSlug: product.handle,
        quantity,
        snapshot: {
          name: product.title,
          price: parseFloat(product.priceRange.minVariantPrice.amount),
          currency: product.priceRange.minVariantPrice.currencyCode,
          imageUrl: product.images.edges[0]?.node.url ?? null,
        },
      },
    ]);
    setSubmittingMethod(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="font-serif text-2xl">{t("product.loadErrorTitle")}</h2>
            <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
              <Link to="/">{t("common.home")}</Link>
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const price = product.priceRange.minVariantPrice;
  const total = parseFloat(price.amount) * quantity;
  const image = product.images.edges[0]?.node;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 mx-auto max-w-lg w-full px-4 py-8 sm:px-6">
        <Button variant="ghost" className="-ml-2 rounded-full" onClick={goBackToProduct}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back")}
        </Button>

        <h1 className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">
          {t("checkout.title")}
        </h1>

        <div className="mt-6 flex gap-4 rounded-2xl border border-border/60 bg-card p-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
            {image ? (
              <img
                src={image.url}
                alt={image.altText || displayTitle}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-medium">{displayTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("checkout.quantityLabel")}: {quantity}
            </p>
            <p className="mt-1 font-serif text-lg font-semibold text-primary">
              {total.toFixed(2)}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                {t("product.currencyLabel")}
              </span>
            </p>
          </div>
        </div>

        <section className="mt-6 space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="quickbuy-address">{t("checkout.address")}</Label>
            <Input
              id="quickbuy-address"
              type="text"
              autoComplete="street-address"
              placeholder={t("home.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-xl px-4"
              maxLength={200}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quickbuy-phone">{t("home.phoneLabel")}</Label>
            <Input
              id="quickbuy-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("home.phonePlaceholder")}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="h-11 rounded-xl px-4"
              maxLength={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quickbuy-zone">{t("home.deliveryZoneLabel")}</Label>
            <select
              id="quickbuy-zone"
              value={zoneId ?? ""}
              onChange={(e) => setZoneId(e.target.value || null)}
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm"
            >
              <option value="">{t("home.zoneNotSelected")}</option>
              {(deliveryZones ?? []).map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <div className="mt-6 grid gap-3">
          <Button
            size="lg"
            className="h-14 rounded-full text-base"
            disabled={isSubmitting}
            onClick={() => void handlePay("ONLINE")}
          >
            {submittingMethod === "ONLINE" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" /> {t("checkout.payOnlineButton")}
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-full text-base"
            disabled={isSubmitting}
            onClick={() => void handlePay("CASH")}
          >
            {submittingMethod === "CASH" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t("checkout.payCashButton")
            )}
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

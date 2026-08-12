import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchStore } from "@/stores/searchStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { Truck, Loader2, ShoppingBasket, MessageCircle, CreditCard, Send } from "lucide-react";
import { fetchCatalogProducts } from "@/lib/catalog";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { listCategories } from "@/api/category";
import { listActiveBanners } from "@/api/design";
import { listDeliveryZones } from "@/api/delivery-zone";
import { BRAND } from "@/config/brand";
import { CONTACT } from "@/config/contact";
import { useTranslation } from "@/i18n/LanguageProvider";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { SubcategoryGrid } from "@/components/home/SubcategoryGrid";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const search = useSearchStore((s) => s.search);
  // Search runs server-side (the full catalog, not just the loaded page) —
  // debounce so typing doesn't fire a request per keystroke.
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // useInfiniteQuery keys on debouncedSearch, so a new search term starts a
  // fresh query (back to page one) instead of appending to the old results;
  // already-fetched pages stay cached in data.pages and are never refetched
  // just to render — fetchNextPage() only ever asks for the next cursor.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["products", debouncedSearch],
    queryFn: ({ pageParam }) =>
      fetchCatalogProducts({ search: debouncedSearch, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Categories change rarely — a single unpaginated fetch, cached for a
  // while, is enough (unlike the product list above).
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
  const topLevelCategories = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === null),
    [categories],
  );

  // Задача: двухуровневая навигация категорий на главном экране — верхняя
  // панель выбирает основную категорию (не переходя со страницы), нижняя
  // показывает её подкатегории. null falls back to a default top-level
  // category (so the second row has something to show immediately, instead
  // of requiring a click first) rather than needing an effect to seed it.
  //
  // There is no category literally named «Продукты» in the real catalog
  // today (9 flat top-level categories, checked directly against
  // production before implementing this) — per the task's own fallback
  // ("«Продукты» или фактическая существующая категория, которая
  // соответствует продуктовому разделу"), "Мука и крупы" is the preferred
  // default. Falls back to the first top-level category by sort order if
  // that slug is ever renamed/removed, rather than defaulting to nothing.
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const defaultCategoryId =
    topLevelCategories.find((c) => c.slug === "muka-krupy")?.id ??
    topLevelCategories[0]?.id ??
    null;
  const activeCategoryId = selectedCategoryId ?? defaultCategoryId;
  const activeCategory = useMemo(
    () => topLevelCategories.find((c) => c.id === activeCategoryId) ?? null,
    [topLevelCategories, activeCategoryId],
  );
  const activeSubcategories = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === activeCategoryId),
    [categories, activeCategoryId],
  );
  // Of today's 9 real top-level categories, only one ("Электро
  // матетериалы") actually has a subcategory — the rest are flat. If a top
  // category's click only ever selected it (never navigated), those 8
  // categories' own products would become unreachable through this nav —
  // there'd be nothing to drill into. So a category with zero subcategories
  // still goes straight to its own product page on click, exactly like
  // before this navigation existed; only a category that actually has
  // subcategories switches the row below instead of navigating away.
  const subcategoryCountByParentId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of categories ?? []) {
      if (!c.parentId) continue;
      counts.set(c.parentId, (counts.get(c.parentId) ?? 0) + 1);
    }
    return counts;
  }, [categories]);

  // design.md — purely additive: the Hero below only changes if an admin
  // actually publishes an active banner; an empty result renders nothing.
  const { data: banners } = useQuery({
    queryKey: ["banners", "active"],
    queryFn: listActiveBanners,
    staleTime: 5 * 60 * 1000,
  });
  const banner = banners?.[0] ?? null;

  // One shared call to the universal translation hook for every dynamic
  // text this page displays (brand name, category names, active banner) —
  // Промпт №097.
  const pageTranslations = useTranslatedTexts(
    [
      BRAND.name,
      // All categories (not just top-level) — the second nav row below
      // shows whichever category's subcategories are active, so their names
      // need to already be translated, not just the first-selected one's.
      ...(categories ?? []).map((c) => c.name),
      ...(banner ? [banner.title, ...(banner.subtitle ? [banner.subtitle] : [])] : []),
    ],
    language,
  );
  const displayBrandName = pageTranslations[BRAND.name] ?? BRAND.name;

  const products = useMemo(() => {
    const seen = new Set<string>();
    const merged: CatalogProductNode[] = [];
    for (const page of data?.pages ?? []) {
      for (const product of page.items) {
        if (seen.has(product.node.id)) continue;
        seen.add(product.node.id);
        merged.push(product);
      }
    }
    return merged;
  }, [data]);

  const [phone, setPhone] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);
  const { address, setAddress, zoneId, setZoneId, setPaymentMethod, setCustomerPhone } =
    useCheckoutStore();

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  const handleSaveAddress = () => {
    if (address.trim().length < 5) {
      toast.error(t("home.enterFullAddressError"));
      return;
    }
    setAddress(address.trim());
    toast.success(t("home.addressSavedToast"));
    setAddressOpen(false);
  };

  const normalizePhone = (raw: string) => raw.replace(/[^\d]/g, "");

  const buildMessage = (clientPhone: string) =>
    t("home.subscribeMessageTemplate", { phone: clientPhone });

  const handleSubscribe = (channel: "whatsapp" | "telegram") => {
    const clientPhone = normalizePhone(phone);
    if (clientPhone.length < 9) {
      toast.error(t("home.invalidPhoneError"));
      return;
    }
    const text = encodeURIComponent(buildMessage(clientPhone));
    const url =
      channel === "whatsapp"
        ? `https://wa.me/${CONTACT.whatsapp}?text=${text}`
        : `https://t.me/${CONTACT.telegram}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success(t("home.subscribeMessageToast"));
    setDialogOpen(false);
    setPhone("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showLanguageSwitcher safeAreaTop />

      {/* Горизонтальная панель основных категорий, над Hero — доступна без
          прокрутки. Не менялась (Этап: трёхуровневая навигация — п.
          "Не менять главные категории"). Клик по категории с
          подкатегориями ВЫБИРАЕТ её (кнопка, не ссылка — не уходит со
          страницы) и обновляет центральную сетку подкатегорий ниже; клик
          по категории без подкатегорий ведёт сразу на её страницу товаров
          (см. subcategoryCountByParentId выше — иначе товары таких
          категорий стали бы недостижимы через эту панель). Не sticky —
          постоянно закреплённая панель уменьшила бы видимую область
          контента. */}
      {topLevelCategories.length > 0 && (
        <nav aria-label={t("nav.categories")} className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pt-3 pb-3 sm:px-6">
            {topLevelCategories.map((c) => {
              const displayName =
                language === DEFAULT_LANGUAGE ? c.name : (pageTranslations[c.name] ?? c.name);
              const isActive = c.id === activeCategoryId;
              const hasSubcategories = (subcategoryCountByParentId.get(c.id) ?? 0) > 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    if (hasSubcategories) {
                      setSelectedCategoryId(c.id);
                    } else {
                      void navigate({ to: "/category/$slug", params: { slug: c.slug } });
                    }
                  }}
                  className={
                    isActive
                      ? "flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors"
                      : "flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-primary bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
                  }
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Hero — Этап №10, п.7: tightened on mobile only (`sm:`/`md:` restore
          the exact original desktop spacing/size) so a phone visitor reaches
          actual categories/products sooner, without touching the desktop
          hero, which wasn't broken. */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-8 text-center sm:pt-16 sm:pb-16 md:pt-24 md:pb-24">
          <div className="inline-block rounded-2xl bg-primary px-6 py-3 shadow-[var(--shadow-card)] md:px-12 md:py-6">
            <h1 className="font-serif text-3xl leading-[1.02] tracking-tight text-primary-foreground sm:text-5xl md:text-7xl">
              «{displayBrandName}»
            </h1>
          </div>
        </div>

        {banner && (
          <div className="mx-auto max-w-4xl px-6 pb-16">
            <a
              href={banner.linkUrl ?? "#categories"}
              className="block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              {banner.imageUrl && (
                <img
                  src={banner.imageUrl}
                  alt={pageTranslations[banner.title] ?? banner.title}
                  loading="lazy"
                  className="w-full max-h-64 object-cover"
                />
              )}
              <div className="p-6 text-center">
                <p className="font-serif text-2xl text-accent">
                  {pageTranslations[banner.title] ?? banner.title}
                </p>
                {banner.subtitle && (
                  <p className="mt-1 text-muted-foreground">
                    {pageTranslations[banner.subtitle] ?? banner.subtitle}
                  </p>
                )}
              </div>
            </a>
          </div>
        )}
      </section>

      {/* Подкатегории выбранной основной категории — в центре экрана, под
          логотипом, вертикальной сеткой (2 колонки, своя прокрутка).
          Клик по подкатегории ведёт на отдельную страницу товаров
          (/category/$categorySlug/subcategory/$subcategorySlug), не на
          общий /category/$slug — Этап: трёхуровневая навигация.
          Обновляется при выборе другой основной категории в панели выше
          (activeSubcategories пересчитывается от activeCategoryId). */}
      {activeCategory && activeSubcategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-8 w-full sm:py-12">
          <h2 className="mb-4 font-serif text-2xl tracking-tight sm:text-3xl">
            {language === DEFAULT_LANGUAGE
              ? activeCategory.name
              : (pageTranslations[activeCategory.name] ?? activeCategory.name)}
          </h2>
          <SubcategoryGrid
            categorySlug={activeCategory.slug}
            subcategories={activeSubcategories.map((sub) => ({
              id: sub.id,
              slug: sub.slug,
              name:
                language === DEFAULT_LANGUAGE ? sub.name : (pageTranslations[sub.name] ?? sub.name),
              imageUrl: sub.imageUrl,
            }))}
          />
        </section>
      )}

      {/* Products */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-6 w-full flex-1 sm:py-12">
        <div className="mb-5 sm:mb-10">
          <h2 className="font-serif text-2xl tracking-tight sm:text-4xl md:text-5xl">
            {t("home.productsHeading")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("home.productsSubheading")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12 sm:py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-12 text-center sm:py-24">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBasket className="h-6 w-6 text-primary" />
            </div>
            {debouncedSearch ? (
              <>
                <h3 className="font-serif text-2xl">{t("home.noResultsTitle")}</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  {t("home.noResultsDescription", { query: debouncedSearch })}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-serif text-2xl">{t("home.catalogEmptyTitle")}</h3>
                <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                  {t("home.catalogEmptyDescription")}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-full"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("common.showMore")
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Delivery & Payment */}
      <section id="delivery" className="mx-auto max-w-7xl px-6 pb-24 grid gap-6 md:grid-cols-3">
        <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">{t("checkout.address")}</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{t("checkout.address")}</DialogTitle>
              <DialogDescription>{t("home.addressDialogDescription")}</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAddress();
              }}
              className="grid gap-4 mt-2"
            >
              <div className="grid gap-2">
                <Label htmlFor="delivery-address">{t("home.addressFieldLabel")}</Label>
                <Input
                  id="delivery-address"
                  type="text"
                  autoComplete="street-address"
                  placeholder={t("home.addressPlaceholder")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 rounded-full px-5"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{t("home.addressHint")}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="delivery-zone">{t("home.deliveryZoneLabel")}</Label>
                <select
                  id="delivery-zone"
                  value={zoneId ?? ""}
                  onChange={(e) => setZoneId(e.target.value || null)}
                  className="h-12 rounded-full border border-input bg-background px-5 text-sm"
                >
                  <option value="">{t("home.zoneNotSelected")}</option>
                  {(deliveryZones ?? []).map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">{t("home.deliveryZoneHint")}</p>
              </div>
              <Button type="submit" size="lg" className="h-14 rounded-full text-base">
                {t("home.saveAddressButton")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">{t("checkout.paymentMethod")}</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {t("home.choosePaymentMethodTitle")}
              </DialogTitle>
              <DialogDescription>{t("home.paymentMethodDialogDescription")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 mt-2">
              <Button
                size="lg"
                className="h-14 rounded-full text-base"
                onClick={() => {
                  setPaymentMethod("ONLINE");
                  toast.info(t("home.onlinePaymentSelectedToast"));
                }}
              >
                <CreditCard className="h-5 w-5" /> {t("home.payOnlineButton")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full text-base"
                onClick={() => {
                  setPaymentMethod("CASH");
                  toast.success(t("home.cashPaymentSelectedToast"));
                }}
              >
                {t("home.payCashButton")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-left rounded-2xl bg-card border border-border/60 p-8 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40 cursor-pointer"
            >
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl">{t("home.orderNotificationsTitle")}</h3>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {t("home.notificationsDialogTitle")}
              </DialogTitle>
              <DialogDescription>{t("home.notificationsDialogDescription")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 mt-2">
              <div className="grid gap-2">
                <Label htmlFor="subscribe-phone">{t("home.phoneLabel")}</Label>
                <Input
                  id="subscribe-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={t("home.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setCustomerPhone(e.target.value);
                  }}
                  className="h-12 rounded-full px-5"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground">{t("home.phoneHint")}</p>
              </div>
              <div className="grid gap-3">
                <Button
                  type="submit"
                  size="lg"
                  onClick={() => handleSubscribe("whatsapp")}
                  className="h-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 text-white text-base"
                >
                  <MessageCircle className="h-5 w-5" /> {t("home.getViaWhatsapp")}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  onClick={() => handleSubscribe("telegram")}
                  className="h-14 rounded-full bg-[#229ED9] hover:bg-[#229ED9]/90 text-white text-base"
                >
                  <Send className="h-5 w-5" /> {t("home.getViaTelegram")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <SiteFooter />
    </div>
  );
}

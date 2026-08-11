import { createFileRoute, Link } from "@tanstack/react-router";
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
import catFlour from "@/assets/cat-flour.png";
import catProduce from "@/assets/cat-produce.png";
import catOils from "@/assets/cat-oils.png";
import catDrinks from "@/assets/cat-drinks.png";
import catSweets from "@/assets/cat-sweets.png";
import catDairy from "@/assets/cat-dairy.png";
import catMeat from "@/assets/cat-meat.png";

export const Route = createFileRoute("/")({
  component: Home,
});

// image_url is still empty for every seeded category (nothing's been
// uploaded to Supabase Storage yet) — these keep the section looking the way
// it always has until real photos are set via category-images. A slug with
// no entry here (e.g. "hleb-vypechka" — seeded in the DB but never given a
// local asset) must fall through to the "Нет фото" placeholder below, not to
// another category's specific image: this map used to also expose a shared
// DEFAULT_FALLBACK_IMAGE equal to catProduce, so any unmapped category
// silently rendered as "Овощи и фрукты" instead of admitting it has no photo.
const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
  "muka-krupy": catFlour,
  "ovoshchi-frukty": catProduce,
  masla: catOils,
  napitki: catDrinks,
  sladosti: catSweets,
  molochnoe: catDairy,
  myasnoe: catMeat,
};

function Home() {
  const { t, language } = useTranslation();
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
  // Stage 11: the home grid shows only top-level categories — subcategories
  // (parentId set) are reached by drilling into their parent's own page, the
  // same hierarchy that's already flat/unfiltered here for every category
  // that has no parent (today's entire real dataset), so this is a no-op
  // until a subcategory actually exists.
  const topLevelCategories = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === null),
    [categories],
  );

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
      ...topLevelCategories.map((c) => c.name),
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

      {/* Задача №2 — quick-access horizontal category strip, above the Hero
          so it's reachable with zero scrolling. Reuses the exact same
          topLevelCategories list (same categories table, same sort_order,
          same admin CRUD in admin/catalog) as the visual grid further down
          — a second, compact presentation of identical data, not a new
          data source. Not sticky: a permanently-pinned second bar under the
          header would permanently shrink the content viewport, working
          against this whole initiative's "minimize vertical chrome"
          direction from earlier stages. */}
      {topLevelCategories.length > 0 && (
        <nav aria-label={t("nav.categories")} className="border-b border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
            {topLevelCategories.map((c) => {
              const displayName =
                language === DEFAULT_LANGUAGE ? c.name : (pageTranslations[c.name] ?? c.name);
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="flex h-11 shrink-0 items-center whitespace-nowrap rounded-full border border-border/60 bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {displayName}
                </Link>
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

          <div className="mt-6 flex flex-wrap gap-3 justify-center sm:mt-8">
            <Button asChild size="lg" className="h-12 px-6 text-base rounded-full">
              <a href="#categories">{t("nav.categories")}</a>
            </Button>
            <Button asChild size="lg" className="h-12 px-6 text-base rounded-full">
              <a href="#delivery">{t("home.deliverySectionLink")}</a>
            </Button>
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

      {/* Categories — Этап №10, п.8: an empty catalog (no top-level
          categories yet) skips this whole section instead of rendering a
          silent, empty padded block with nothing in it. */}
      {topLevelCategories.length > 0 && (
        <section id="categories" className="mx-auto max-w-7xl px-6 py-8 w-full sm:py-16">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {topLevelCategories.map((c) => {
              const image = c.imageUrl || FALLBACK_IMAGE_BY_SLUG[c.slug];
              // Category names are entered once, in Russian, by the admin — no
              // per-category language field exists or is added (Промпт №092).
              // The interface language decides display: the original text when
              // it matches the source language, otherwise the AI-translated
              // text (falls back to the original while the translation is
              // still loading or unavailable, never a blank name).
              const displayName =
                language === DEFAULT_LANGUAGE ? c.name : (pageTranslations[c.name] ?? c.name);
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
                >
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-secondary/40">
                    {image ? (
                      <img
                        src={image}
                        alt={displayName}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        {t("common.noPhoto")}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 font-serif text-lg text-primary">{displayName}</div>
                </Link>
              );
            })}
          </div>
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

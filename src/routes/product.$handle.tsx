import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, LayoutDashboard, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchCatalogProduct } from "@/lib/catalog";
import { useCartStore } from "@/stores/cartStore";
import { BRAND } from "@/config/brand";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { ImageLightbox } from "@/components/product/ImageLightbox";
import { isNativePlatform } from "@/lib/capabilities/platform";
import { BOTTOM_TAB_BAR_HEIGHT_REM } from "@/components/BottomTabBar";

/** `from=admin` — set only by the admin catalog's own "view on storefront"
 * link (Этап №3); everywhere else this is simply absent, so the "return to
 * admin panel" button only ever renders when it's genuinely reachable. */
const productSearchSchema = z.object({
  from: z.enum(["admin"]).optional(),
});

function ProductErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-2xl">{t("product.loadErrorTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} size="lg" className="mt-6 h-12 rounded-full px-8">
          {t("common.retry")}
        </Button>
      </div>
    </div>
  );
}

function ProductNotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-3xl">{t("product.notFoundTitle")}</h2>
        <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
          <Link to="/">{t("common.home")}</Link>
        </Button>
      </div>
    </div>
  );
}

/** Shared between the loader (SSR prefetch) and the component's own
 * useQuery, so both hit the exact same cache entry — no duplicate fetch. */
const productQueryKey = (handle: string) => ["product", handle] as const;

export const Route = createFileRoute("/product/$handle")({
  component: ProductPage,
  validateSearch: productSearchSchema,
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData({
      queryKey: productQueryKey(params.handle),
      queryFn: () => fetchCatalogProduct(params.handle),
    });
    return { product };
  },
  head: ({ params, loaderData }) => {
    const product = loaderData?.product;
    const title = product ? `${product.title} — ${BRAND.name}` : `${params.handle} — ${BRAND.name}`;
    const description = product?.description?.trim() || BRAND.description;
    const image = product?.images.edges[0]?.node.url || BRAND.ogImage;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
      ],
    };
  },
  errorComponent: ProductErrorComponent,
  notFoundComponent: ProductNotFoundComponent,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t, language } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  // Задача №244 — fullscreen pinch-zoom viewer, opened by tapping the main
  // photo; shares selectedImage/setSelectedImage with the page itself so
  // swiping to a different photo inside it keeps the thumbnail rail (and
  // the page's own state) in sync, both while open and after closing.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Часть 3 задачи "СТРАНИЦА ТОВАРА" — количество, выбираемое ДО добавления
  // в корзину/покупки, независимо от того, что уже лежит в корзине (в
  // отличие от прежнего CartQuantityControl, где "количество" — это и есть
  // количество в корзине). Сбрасывается в 1 при переходе на другой товар
  // (соседний по свайпу/похожий) — иначе выбранное количество одного товара
  // молча перенеслось бы на совсем другой.
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    setQuantity(1);
  }, [handle]);

  // Задача №299 — Часть А: on the native app, __root.tsx mounts a
  // GLOBAL fixed bottom nav bar (BottomTabBar, z-40) on every route. This
  // page's own sticky one-handed purchase bar below is also fixed to the
  // very bottom of the viewport (same as before this fix); with both
  // pinned to `bottom: 0`, the nav bar sat on top and completely covered
  // the Купить/В корзину button row underneath — confirmed live via
  // elementFromPoint at the button's own screen position, which resolved
  // to the nav bar, not the button. Reproduces on every product page in
  // the app, regardless of how the buyer got there (catalog, search, a
  // direct link) — not specific to search. Same start-`false`-then-flip
  // pattern as __root.tsx's own useShowBottomTabBar, for the same reason
  // (matches SSR's always-`false` output, no hydration mismatch).
  const [showBottomTabBar, setShowBottomTabBar] = useState(false);
  useEffect(() => {
    setShowBottomTabBar(isNativePlatform());
  }, []);

  const {
    data: product,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: productQueryKey(handle),
    queryFn: () => fetchCatalogProduct(handle),
    retry: false,
  });

  // Called unconditionally (rules of hooks) — falls back to empty strings
  // before the product has loaded; useTranslatedTexts filters those out.
  const translations = useTranslatedTexts(
    [product?.title ?? "", product?.description ?? ""],
    language,
  );

  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSignInFallback />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : t("product.loadErrorTitle");
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSignInFallback />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="font-serif text-2xl">{t("product.loadErrorTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
              <Link to="/">{t("common.home")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Throwing here (during render) is what actually engages the route's
  // notFoundComponent — throwing notFound() inside queryFn above did not:
  // React Query catches all queryFn errors internally into `error` and never
  // rethrows them, so that throw was silently swallowed and this page
  // rendered blank for every missing (or failed) product.
  if (!product) {
    throw notFound();
  }

  const images = product.images.edges;
  const activeImage = images[selectedImage] ?? images[0];
  // Задача №206 — cyclic within this same product's own photos.
  const goToPrevImage = () => setSelectedImage((i) => (i - 1 + images.length) % images.length);
  const goToNextImage = () => setSelectedImage((i) => (i + 1) % images.length);

  // Задача №238 — swipe now only cycles this product's own photos (same
  // behavior as the arrow buttons above), never navigates to a different
  // product. The cross-product sibling machinery this used to call
  // (prevSibling/nextSibling/goToSibling, and the category-order query
  // behind them) was removed outright rather than left dead — nothing else
  // on this page read it. Browsing other products in the category still
  // works, just via the subcategory's own product list, not a swipe here.
  const SWIPE_THRESHOLD_PX = 50;
  // Задача №244 — a tap (negligible movement on both axes) opens the
  // fullscreen lightbox; a horizontal swipe still switches this product's
  // photos, exactly as before — same touch zone, disambiguated purely by
  // how far the finger actually moved, so the two gestures never conflict.
  const TAP_MOVEMENT_PX = 10;
  const handleImageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };
  const handleImageTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (startX === null) return;
    // Suppresses the browser's own delayed click-synthesis for this touch
    // (standard mobile behavior — a `click` fires shortly after touchend at
    // the same point) — without this, a tap that opens the lightbox could
    // get its own follow-up synthetic click delivered to the lightbox
    // AFTER it mounts and now covers that same point, bubbling to its
    // backdrop's onClose and closing it again immediately. Doesn't affect
    // the container's touch-pan-y native vertical scroll — that's governed
    // by touchmove/touch-action, not a touchend preventDefault.
    e.preventDefault();
    const endTouch = e.changedTouches[0];
    const deltaX = (endTouch?.clientX ?? startX) - startX;
    const deltaY = (endTouch?.clientY ?? startY ?? 0) - (startY ?? 0);

    if (Math.abs(deltaX) < TAP_MOVEMENT_PX && Math.abs(deltaY) < TAP_MOVEMENT_PX) {
      if (activeImage) setLightboxOpen(true);
      return;
    }
    if (images.length <= 1) return;
    if (deltaX <= -SWIPE_THRESHOLD_PX) {
      goToNextImage();
    } else if (deltaX >= SWIPE_THRESHOLD_PX) {
      goToPrevImage();
    }
  };
  const price = product.priceRange.minVariantPrice;
  const variant = product.variants.edges[0]?.node;
  const maxQuantity = product.inStock ? Math.max(1, product.stock) : 1;
  const canPurchase = product.inStock && !!variant;

  const displayTitle = translations[product.title] ?? product.title;
  const displayDescription = product.description
    ? (translations[product.description] ?? product.description)
    : null;

  const decreaseQuantity = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQuantity = () => setQuantity((q) => Math.min(maxQuantity, q + 1));

  const handleAddToCart = async () => {
    if (!variant) return;
    const added = await addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
    if (added) {
      toast.success(t("product.addedToCartToast"), {
        description: displayTitle,
        position: "top-center",
      });
    }
  };

  // Часть 6 задачи — «Купить в один клик» больше не создаёт заказ прямо
  // здесь: ведёт на отдельную страницу оплаты (/checkout/quick-buy) с двумя
  // вариантами (онлайн/наличные), передав товар и количество через search
  // params. Сама отправка заказа (useCreateOrder) теперь живёт там.
  const handleBuyNow = () => {
    if (!variant) return;
    void navigate({
      to: "/checkout/quick-buy",
      search: { productSlug: product.handle, quantity },
    });
  };

  // Часть 3/4 задачи — общий блок [-] количество [+] и две кнопки покупки,
  // используется и в основной колонке (десктоп), и в закреплённой нижней
  // панели (мобильный) — одна и та же логика/состояние, не дублируется.
  const purchaseControls = (
    <div className="space-y-3">
      <div className="flex h-11 w-fit items-center gap-1 rounded-full bg-secondary">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onClick={decreaseQuantity}
          disabled={quantity <= 1 || !canPurchase}
          aria-label={t("product.decreaseQuantity")}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span
          className="min-w-[2rem] flex-1 text-center text-base font-medium tabular-nums"
          aria-live="polite"
        >
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onClick={increaseQuantity}
          disabled={quantity >= maxQuantity || !canPurchase}
          aria-label={t("product.increaseQuantity")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={handleBuyNow}
          disabled={!canPurchase}
          className="h-12 rounded-full text-sm font-semibold shadow-md"
        >
          {t("product.buyNowButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleAddToCart()}
          disabled={!canPurchase || cartLoading}
          className="h-12 rounded-full text-sm font-semibold"
        >
          {cartLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("product.addToCartShortButton")
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSignInFallback />
      {/* Этап №3 — mobile-first rework: tight top nav row, image with
          overlaid prev/next + swipe (zero extra vertical space), compact
          info block, sticky one-handed add-to-cart bar on mobile only.
          Desktop (`lg:`) keeps its previous, more spacious layout. */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-3 pb-36 sm:px-6 lg:pt-12 lg:pb-12">
        {/* Отдельная кнопка "Назад к категориям" под шапкой убрана (Часть 3
            задачи о комплексной оптимизации) — дублировала уже имеющуюся в
            SiteHeader реальную кнопку "← Назад" (та же history-based
            логика). Ссылка "Вернуться в админ-панель" — самостоятельная
            функция, не навигационный дубль, остаётся. */}
        {search.from === "admin" && (
          <div className="mb-3 flex items-center justify-end gap-3 lg:mb-8">
            {/* Only reachable when the admin's own "view on storefront" link
                set from=admin — never shown otherwise (Этап №3, п.4). */}
            <Link
              to="/admin/catalog"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <LayoutDashboard className="h-4 w-4" /> {t("product.returnToAdmin")}
            </Link>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:gap-12">
          <div>
            <div
              className="relative aspect-square touch-pan-y overflow-hidden rounded-2xl bg-secondary lg:rounded-[2rem]"
              onTouchStart={handleImageTouchStart}
              onTouchEnd={handleImageTouchEnd}
              // Задача №244 — desktop has no touch events at all, so a tap
              // there is a plain click on the photo itself (arrow buttons
              // stop propagation below, so clicking them doesn't also
              // trigger this).
              onClick={() => activeImage && setLightboxOpen(true)}
            >
              {activeImage ? (
                <img
                  src={activeImage.node.url}
                  alt={activeImage.node.altText || displayTitle}
                  fetchPriority="high"
                  className={`h-full w-full object-cover cursor-zoom-in ${!product.inStock ? "opacity-60 grayscale-[30%]" : ""}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {t("common.noPhoto")}
                </div>
              )}
              {/* Этап №8, п.7 — out of stock must be visible immediately,
                  before the user even reaches the price/badge row below. */}
              {!product.inStock && (
                <div className="absolute left-0 top-4 rounded-r-full bg-destructive px-4 py-1.5 text-sm font-semibold text-destructive-foreground shadow-md">
                  {t("product.outOfStock")}
                </div>
              )}
              {/* Задача №206/№238 — these switch this same product's own
                  photos (cyclic), overlaid on the image so they cost zero
                  extra vertical space. Swiping the image area does the same
                  thing (handleImageTouchStart/End above). */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  aria-label={t("product.prevImage")}
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  aria-label={t("product.nextImage")}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-2 grid grid-cols-5 gap-2 lg:mt-4 lg:gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.node.url}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-secondary border-2 transition-colors lg:rounded-xl ${
                      index === selectedImage ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.node.url}
                      alt={image.node.altText || displayTitle}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            {/* Этап №8, п.8 — title stays descriptive-sized; price is the
                decision-critical number, so it's deliberately the single
                largest, boldest piece of text on the whole screen. Часть 5
                задачи "СТРАНИЦА ТОВАРА" — раздел категории/подкатегории под
                фото убран, здесь остаются только название, описание, цена,
                статус наличия. */}
            <h1 className="font-serif text-lg font-medium tracking-tight sm:text-xl lg:text-2xl">
              {displayTitle}
            </h1>

            {displayDescription && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line lg:mt-3 lg:text-base">
                {displayDescription}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 lg:mt-4">
              <span className="font-serif text-3xl font-bold text-primary lg:text-5xl">
                {parseFloat(price.amount).toFixed(2)}
              </span>
              <span className="text-base font-medium text-muted-foreground lg:text-xl">
                {t("product.currencyLabel")}
              </span>
              {product.unit && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {t("product.unit")}: {product.unit}
                </span>
              )}
            </div>
            {product.inStock && (
              <Badge variant="secondary" className="mt-2">
                {t("product.inStock")}
              </Badge>
            )}

            {/* Количество + две кнопки покупки — inline здесь на десктопе
                only, мобильный использует закреплённую нижнюю панель ниже
                (см. purchaseControls). */}
            <div className="mt-6 hidden max-w-sm lg:block">{purchaseControls}</div>

            {/* Characteristics as compact inline chips instead of a spaced-out
                definition list — same information, far less vertical room. */}
            {(product.manufacturer || product.countryOfOrigin) && (
              <div className="mt-4 flex flex-wrap gap-1.5 lg:mt-6">
                {product.manufacturer && (
                  <span className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-secondary-foreground">
                    {t("category.manufacturerLabel")}: {product.manufacturer}
                  </span>
                )}
                {product.countryOfOrigin && (
                  <span className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-secondary-foreground">
                    {t("category.countryLabel")}: {product.countryOfOrigin}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticky one-handed purchase bar — mobile only (Этап №3, п.7);
          desktop keeps the inline controls above instead of a second,
          redundant one. Price stacked above the same [-] qty [+] + two
          buttons block as the desktop column (Часть 2-4 задачи).

          Задача №299 — on the native app this bar sits `showBottomTabBar
          rem above the viewport bottom (the exact height __root.tsx
          already reserves for BottomTabBar, so the two line up flush with
          no gap and no overlap) instead of at `bottom: 0`, so the global
          nav bar (z-40) can no longer cover the Купить/В корзину buttons.
          `pb-safe` is dropped in that case: the offset above already
          clears the safe-area inset (BottomTabBar reserves its own), so
          keeping it too would just add empty space under the buttons. On
          web (showBottomTabBar false) nothing changes — bottom: 0, pb-safe
          kept for iOS PWA's own home-indicator inset. */}
      <div
        className={`fixed inset-x-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden ${
          showBottomTabBar ? "" : "pb-safe"
        }`}
        style={{
          bottom: showBottomTabBar
            ? `calc(${BOTTOM_TAB_BAR_HEIGHT_REM}rem + env(safe-area-inset-bottom))`
            : 0,
        }}
      >
        <div className="px-4 pt-2">
          <p className="truncate text-xs text-muted-foreground">{displayTitle}</p>
          <p className="font-serif text-2xl font-bold text-primary">
            {parseFloat(price.amount).toFixed(2)}{" "}
            <span className="text-sm font-medium text-muted-foreground">
              {t("product.currencyLabel")}
            </span>
          </p>
        </div>
        <div className="px-4 pb-3 pt-2">{purchaseControls}</div>
      </div>

      {/* Задача №244 — fullscreen pinch-zoom viewer. Shares selectedImage
          with the page's own thumbnail rail (onIndexChange), so swiping to
          a different photo in here is reflected there too, both while open
          and after closing. */}
      {lightboxOpen && (
        <ImageLightbox
          images={images.map((image) => ({
            url: image.node.url,
            alt: image.node.altText || displayTitle,
          }))}
          index={selectedImage}
          onIndexChange={setSelectedImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

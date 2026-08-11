import { createFileRoute, Link, notFound, useCanGoBack, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { z } from "zod";
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutDashboard, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ProductCard";
import { CartQuantityControl } from "@/components/CartQuantityControl";
import { fetchCatalogProduct } from "@/lib/catalog";
import { listProducts } from "@/api/catalog";
import { BRAND } from "@/config/brand";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { PLATFORM_VARIANT_PREFIX, toCatalogProductNode } from "@shared/lib/product-adapter";

/** Related-strip size — same order of magnitude as other short lists in the
 * project (e.g. category filter facets); not a paging size, so CATALOG_PAGE_SIZE
 * doesn't apply here. */
const RELATED_PRODUCTS_LIMIT = 8;

/** Same "candidate cap" idiom as product.repository.ts's POPULARITY_CANDIDATE_CAP
 * — large enough to cover any real category for prev/next ordering, without
 * being an actual paginated fetch. */
const SIBLING_PRODUCTS_LIMIT = 200;

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
  const router = useRouter();
  // Этап №7 — true iff there's an in-app previous entry to go back to (not
  // just true whenever history.length > 1, which would also fire for a
  // fresh tab). Lets "Назад к категориям" prefer real browser back (keeps
  // the category page's filters/scroll position intact) and only fall back
  // to a plain link to the category root when there's nothing to go back to
  // — e.g. arriving via a direct/external link.
  const canGoBack = useCanGoBack();
  const { t, language } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const touchStartX = useRef<number | null>(null);

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

  const categorySlug = product?.category?.slug;
  // node.id is PLATFORM_VARIANT_PREFIX + the real product id (see
  // toCatalogProductNode) — recovered here rather than adding a second,
  // redundant raw-id field to the shared node shape.
  const rawProductId = product ? product.id.slice(PLATFORM_VARIANT_PREFIX.length) : undefined;

  // Objective, data-driven relation — same category, publication already
  // restricted to PUBLISHED by listProducts itself, current product
  // excluded server-side. No behavioural/purchase-based relation exists in
  // the project, so none is invented here.
  const { data: relatedResult } = useQuery({
    queryKey: ["related-products", categorySlug, rawProductId],
    queryFn: () =>
      listProducts({
        categorySlug,
        excludeProductId: rawProductId,
        pageSize: RELATED_PRODUCTS_LIMIT,
      }),
    enabled: !!categorySlug && !!rawProductId,
  });
  const relatedProducts = (relatedResult?.items ?? []).map(toCatalogProductNode);

  // Этап №3 — quick prev/next navigation within the current category.
  // Same category ordering as the category page's own default ("newest"),
  // current product included so its index can be located; unlike the
  // related-products query above, nothing is excluded here.
  const { data: siblingResult } = useQuery({
    queryKey: ["category-products-order", categorySlug],
    queryFn: () => listProducts({ categorySlug, pageSize: SIBLING_PRODUCTS_LIMIT }),
    enabled: !!categorySlug,
  });
  const siblingProducts = siblingResult?.items ?? [];
  const siblingIndex = siblingProducts.findIndex((p) => p.id === rawProductId);
  const prevSibling = siblingIndex > 0 ? siblingProducts[siblingIndex - 1] : undefined;
  const nextSibling =
    siblingIndex >= 0 && siblingIndex < siblingProducts.length - 1
      ? siblingProducts[siblingIndex + 1]
      : undefined;

  // Preserves `from=admin` across prev/next so an admin browsing several
  // products in a row via swipe keeps the "return to admin panel" button,
  // instead of it disappearing after the first swipe.
  const goToSibling = (slug: string) => {
    void navigate({ to: "/product/$handle", params: { handle: slug }, search });
  };

  const SWIPE_THRESHOLD_PX = 50;
  const handleImageTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleImageTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? startX) - startX;
    if (deltaX <= -SWIPE_THRESHOLD_PX && nextSibling) {
      goToSibling(nextSibling.slug);
    } else if (deltaX >= SWIPE_THRESHOLD_PX && prevSibling) {
      goToSibling(prevSibling.slug);
    }
  };

  // Called unconditionally (rules of hooks) — falls back to empty strings
  // before the product has loaded; useTranslatedTexts filters those out.
  const translations = useTranslatedTexts(
    [product?.title ?? "", product?.description ?? ""],
    language,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader showLanguageSwitcher safeAreaTop />
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
        <SiteHeader showLanguageSwitcher safeAreaTop />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="font-serif text-2xl">{t("product.loadErrorTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
              <Link to="/">{t("common.home")}</Link>
            </Button>
          </div>
        </div>
        <SiteFooter />
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
  const price = product.priceRange.minVariantPrice;

  const displayTitle = translations[product.title] ?? product.title;
  const displayDescription = product.description
    ? (translations[product.description] ?? product.description)
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showLanguageSwitcher safeAreaTop />
      {/* Этап №3 — mobile-first rework: tight top nav row, image with
          overlaid prev/next + swipe (zero extra vertical space), compact
          info block, sticky one-handed add-to-cart bar on mobile only.
          Desktop (`lg:`) keeps its previous, more spacious layout. */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-3 pb-36 sm:px-6 lg:pt-12 lg:pb-12">
        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-8">
          {/* Этап №7 — real back navigation when there's somewhere to go
              back to (preserves the category page's filters/sort/scroll
              position exactly as the user left them), plain link to the
              category root otherwise. */}
          <button
            type="button"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                void navigate(
                  categorySlug
                    ? { to: "/category/$slug", params: { slug: categorySlug } }
                    : { to: "/" },
                );
              }
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("product.backToCategories")}
          </button>
          {/* Only reachable when the admin's own "view on storefront" link
              set from=admin — never shown otherwise (Этап №3, п.4). */}
          {search.from === "admin" && (
            <Link
              to="/admin/catalog"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <LayoutDashboard className="h-4 w-4" /> {t("product.returnToAdmin")}
            </Link>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:gap-12">
          <div>
            <div
              className="relative aspect-square touch-pan-y overflow-hidden rounded-2xl bg-secondary lg:rounded-[2rem]"
              onTouchStart={handleImageTouchStart}
              onTouchEnd={handleImageTouchEnd}
            >
              {activeImage ? (
                <img
                  src={activeImage.node.url}
                  alt={activeImage.node.altText || displayTitle}
                  fetchPriority="high"
                  className={`w-full h-full object-cover ${!product.inStock ? "opacity-60 grayscale-[30%]" : ""}`}
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
              {/* Quick prev/next within the category — overlaid on the image
                  so it costs zero extra vertical space; swipe on the same
                  image area does the same thing (п.2). Only rendered when
                  there actually is a neighbour to go to. */}
              {prevSibling && (
                <button
                  type="button"
                  onClick={() => goToSibling(prevSibling.slug)}
                  aria-label={t("product.prevProduct")}
                  className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {nextSibling && (
                <button
                  type="button"
                  onClick={() => goToSibling(nextSibling.slug)}
                  aria-label={t("product.nextProduct")}
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
            {product.category && (
              <Link
                to="/category/$slug"
                params={{ slug: product.category.slug }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t("product.categoryLabel")}: {product.category.name}
              </Link>
            )}
            {/* Этап №8, п.8 — title stays descriptive-sized; price is the
                decision-critical number, so it's deliberately the single
                largest, boldest piece of text on the whole screen. */}
            <h1 className="mt-1 font-serif text-lg font-medium tracking-tight sm:text-xl lg:mt-2 lg:text-2xl">
              {displayTitle}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 lg:mt-3">
              <span className="font-serif text-3xl font-bold text-primary lg:text-5xl">
                {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
              </span>
              {product.unit && (
                <span className="text-sm text-muted-foreground">
                  {t("product.unit")}: {product.unit}
                </span>
              )}
            </div>
            {product.inStock && (
              <Badge variant="secondary" className="mt-2">
                {t("product.inStock")}
              </Badge>
            )}

            {/* Characteristics as compact inline chips instead of a spaced-out
                definition list — same information, far less vertical room. */}
            {(product.manufacturer || product.countryOfOrigin) && (
              <div className="mt-2 flex flex-wrap gap-1.5 lg:mt-6">
                {product.manufacturer && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {t("category.manufacturerLabel")}: {product.manufacturer}
                  </span>
                )}
                {product.countryOfOrigin && (
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {t("category.countryLabel")}: {product.countryOfOrigin}
                  </span>
                )}
              </div>
            )}

            {/* Add-to-cart / [-] qty [+] stays inline here on desktop only —
                mobile uses the sticky one-handed bottom bar below instead
                (п.7). Same shared control as ProductCard, so the two never
                disagree on what's already in the cart. Этап №8, п.4/5 —
                full-width, text-labelled: the single most prominent
                interactive element in this column, unmistakably the primary
                action on the page. */}
            <div className="mt-6 hidden max-w-sm lg:block">
              <CartQuantityControl
                product={{ node: product }}
                size="lg"
                showLabel
                className="w-full"
              />
            </div>

            {displayDescription && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line lg:mt-6 lg:text-base">
                {displayDescription}
              </p>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-10 lg:mt-16">
            <h2 className="font-serif text-xl tracking-tight sm:text-2xl lg:text-3xl">
              {t("product.relatedHeading")}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-6 lg:mt-6 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.node.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky one-handed add-to-cart bar — mobile only (Этап №3, п.7);
          desktop keeps the inline button above instead of a second,
          redundant one. Этап №8 — price stacked above a full-width,
          text-labelled CTA (rather than squeezed beside a small icon
          button) so both the price and the purchase action are maximally
          prominent, always in reach, on every scroll position. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur-md pb-safe lg:hidden">
        <div className="px-4 pt-2">
          <p className="truncate text-xs text-muted-foreground">{displayTitle}</p>
          <p className="font-serif text-2xl font-bold text-primary">
            {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
          </p>
        </div>
        <div className="px-4 pb-3 pt-2">
          <CartQuantityControl product={{ node: product }} size="lg" showLabel className="w-full" />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

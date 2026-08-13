import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { Loader2, ShoppingBasket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchCatalogProducts } from "@/lib/catalog";
import { useTranslation } from "@/i18n/LanguageProvider";
import { BRAND } from "@/config/brand";
import type { CatalogProductNode } from "@shared/lib/product-adapter";

// `.catch(undefined)` keeps validateSearch itself from ever throwing on a
// malformed/missing q — same lenient pattern as checkout.quick-buy.tsx;
// SearchPage below renders its own empty-query fallback instead of a raw
// server error.
const searchPageSchema = z.object({
  q: z.string().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: searchPageSchema,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

/**
 * Full results page for the header SearchBar's "Показать все результаты"
 * link (and Enter-to-search) — same fetchCatalogProducts({search}) query the
 * home page's live-filtered grid already uses, just without the
 * category/hero/subcategory chrome that only makes sense on "/". No
 * sort/filter UI (task scope: minimal results grid now, richer controls are
 * a deliberate later addition, not this one).
 */
function SearchPage() {
  const { q } = Route.useSearch();
  const { t } = useTranslation();
  const query = q?.trim() ?? "";

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["products", "search-page", query],
    queryFn: ({ pageParam }) => fetchCatalogProducts({ search: query, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: query.length > 0,
  });

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

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />

      <section className="mx-auto max-w-7xl px-6 py-6 w-full flex-1 sm:py-12">
        <h1 className="mb-5 font-serif text-2xl tracking-tight sm:mb-10 sm:text-4xl md:text-5xl">
          {query ? t("search.resultsTitle", { query }) : t("home.productsHeading")}
        </h1>

        {query.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-12 text-center sm:py-24">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBasket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-2xl">{t("home.noResultsTitle")}</h3>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12 sm:py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-12 text-center sm:py-24">
            <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBasket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-2xl">{t("home.noResultsTitle")}</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              {t("home.noResultsDescription", { query })}
            </p>
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

      <SiteFooter />
    </div>
  );
}

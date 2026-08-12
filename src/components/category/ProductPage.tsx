import { Link, notFound } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { Loader2, ShoppingBasket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchCatalogCategory, fetchCatalogProducts } from "@/lib/catalog";
import { listCategories } from "@/api/category";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSearchStore } from "@/stores/searchStore";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { productSortBySchema } from "@shared/validation/catalog.schema";
import type { CatalogProductNode } from "@shared/lib/product-adapter";

/**
 * Общая логика "категория/подкатегория → товары" — используется двумя
 * разными маршрутами (`/category/$slug` и
 * `/category/$categorySlug/subcategory/$subcategorySlug`), которые для БД
 * идентичны (categories.slug глобально уникален, категория и подкатегория —
 * одна сущность). Вынесено сюда, чтобы не дублировать эту логику во втором
 * маршруте (Этап: трёхуровневая навигация).
 *
 * Часть 3 задачи "УЛУЧШЕНИЕ ПОЛЬЗОВАТЕЛЬСКОЙ ПАНЕЛИ" убрала со страницы
 * брэдкрамбы, вторую (дублирующую) поисковую строку, счётчик "Найдено X
 * товаров" и весь UI сортировки/фильтров — страница теперь ограничена
 * заголовком, подкатегориями и сеткой товаров. sortBy/inStockOnly/
 * minPrice/maxPrice/manufacturers/countriesOfOrigin остаются в схеме и
 * долетают до fetchCatalogProducts как есть (deep-link-совместимость: кто-то
 * может перейти по ссылке с этими параметрами), просто на странице больше
 * нет интерактивных элементов, которые их выставляют.
 */
export const categorySearchSchema = z.object({
  sortBy: productSortBySchema.optional(),
  inStockOnly: z.boolean().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  manufacturers: z.array(z.string()).optional(),
  countriesOfOrigin: z.array(z.string()).optional(),
});

export type CategorySearch = z.infer<typeof categorySearchSchema>;

/** Shared between each route's loader (SSR prefetch) and its own useQuery,
 * so both hit the exact same cache entry — no duplicate fetch. */
export const categoryQueryKey = (slug: string) => ["category", slug] as const;

export function CategoryErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-2xl">{t("category.loadErrorTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} size="lg" className="mt-6 h-12 rounded-full px-8">
          {t("common.retry")}
        </Button>
      </div>
    </div>
  );
}

export function CategoryNotFoundComponent() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h2 className="font-serif text-3xl">{t("category.notFoundTitle")}</h2>
        <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8">
          <Link to="/">{t("common.home")}</Link>
        </Button>
      </div>
    </div>
  );
}

export interface ProductPageProps {
  /** Slug категории ИЛИ подкатегории — обе живут в одной таблице, поиск
   * товаров идёт по точному совпадению category_id, независимо от уровня. */
  slug: string;
  /** Deep-link-совместимые sortBy/filters (Часть 3: на странице больше нет
   * интерактивного UI для их изменения, но значения из URL по-прежнему
   * применяются к запросу товаров). */
  search: CategorySearch;
}

export function ProductPage({ slug, search }: ProductPageProps) {
  const { t, language } = useTranslation();

  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryIsError,
    error: categoryError,
  } = useQuery({
    queryKey: categoryQueryKey(slug),
    queryFn: () => fetchCatalogCategory(slug),
    retry: false,
  });

  // Stage 10's hierarchy fields (parentId), applied to the same flat
  // category list the home page already fetches — reused as-is here for
  // subcategory tiles, rather than adding a new tree/ancestry endpoint.
  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
  const subcategories = useMemo(
    () => (allCategories ?? []).filter((c) => c.parentId === category?.id),
    [allCategories, category?.id],
  );

  // Единая поисковая строка приложения (та же, что в SiteHeader) — вторая,
  // локальная для этой страницы, была удалена как дублирующая (Часть 3).
  const globalSearch = useSearchStore((s) => s.search);
  const debouncedSearchTerm = useDebouncedValue(globalSearch.trim(), 300);

  // useInfiniteQuery keys on category slug + every filter/sort value, so
  // changing any of them starts a fresh query from page one (same mechanism
  // as the home page's search — Stage 6 reuses it, doesn't invent a new
  // one) instead of appending to stale results from the previous selection.
  const {
    data,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "products",
      "category",
      slug,
      debouncedSearchTerm,
      search.sortBy,
      search.inStockOnly,
      search.minPrice,
      search.maxPrice,
      search.manufacturers,
      search.countriesOfOrigin,
    ],
    queryFn: ({ pageParam }) =>
      fetchCatalogProducts({
        categorySlug: slug,
        cursor: pageParam,
        search: debouncedSearchTerm || undefined,
        sortBy: search.sortBy,
        inStockOnly: search.inStockOnly,
        minPrice: search.minPrice,
        maxPrice: search.maxPrice,
        manufacturers: search.manufacturers,
        countriesOfOrigin: search.countriesOfOrigin,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!category,
    retry: false,
  });

  // Same de-dup-by-id defence as the home page's merge: guards against an
  // item shifting across the offset-pagination boundary (e.g. a concurrent
  // insert/sort-affecting update between page fetches) ever rendering twice.
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

  const translations = useTranslatedTexts(
    [category?.name ?? "", ...subcategories.map((c) => c.name)],
    language,
  );
  const translateCategoryName = (name: string) =>
    language === DEFAULT_LANGUAGE ? name : (translations[name] ?? name);

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (categoryIsError) {
    const message =
      categoryError instanceof Error ? categoryError.message : t("category.loadErrorTitle");
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="font-serif text-2xl">{t("category.loadErrorTitle")}</h2>
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

  if (!category) {
    throw notFound();
  }

  const displayName = translateCategoryName(category.name);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 mx-auto max-w-7xl px-4 pt-4 pb-12 w-full sm:px-6 lg:pt-12">
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl lg:text-5xl">
          {displayName}
        </h1>
        {/* Secondary copy, not needed for fast browsing — kept for desktop only. */}
        {category.description && (
          <p className="mt-2 hidden text-muted-foreground max-w-2xl lg:block">
            {category.description}
          </p>
        )}

        {subcategories.length > 0 && (
          <section className="mt-4 lg:mt-8">
            <h2 className="hidden font-serif text-xl lg:block">
              {t("category.subcategoriesHeading")}
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:mt-4 lg:flex-wrap lg:gap-3 lg:overflow-visible lg:pb-0">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to="/category/$slug"
                  params={{ slug: sub.slug }}
                  className="shrink-0 whitespace-nowrap rounded-full border border-border/60 bg-card px-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40 lg:px-5 lg:py-2.5"
                >
                  {translateCategoryName(sub.name)}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 lg:mt-10">
          {productsLoading ? (
            <div className="flex justify-center py-12 sm:py-24">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border py-12 text-center sm:py-24">
              <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBasket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl">{t("home.catalogEmptyTitle")}</h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                {t("home.catalogEmptyDescription")}
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
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

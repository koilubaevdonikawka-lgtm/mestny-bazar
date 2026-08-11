import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import { z } from "zod";
import { Loader2, Search, ShoppingBasket, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import {
  fetchCatalogCategory,
  fetchCatalogCategoryFacetSource,
  fetchCatalogProducts,
} from "@/lib/catalog";
import { listCategories } from "@/api/category";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCloseOnBackButton } from "@/hooks/useCloseOnBackButton";
import { BRAND } from "@/config/brand";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { productSortBySchema } from "@shared/validation/catalog.schema";
import type { ProductSortBy } from "@shared/contracts/catalog";
import type { CatalogProductNode } from "@shared/lib/product-adapter";
import { getCategoryAncestry } from "@shared/lib/category-tree";

const categorySearchSchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  sortBy: productSortBySchema.optional(),
  inStockOnly: z.boolean().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  manufacturers: z.array(z.string()).optional(),
  countriesOfOrigin: z.array(z.string()).optional(),
});

type CategorySearch = z.infer<typeof categorySearchSchema>;

function CategoryErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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

function CategoryNotFoundComponent() {
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

/** Shared between the loader (SSR prefetch) and the component's own
 * useQuery, so both hit the exact same cache entry — no duplicate fetch. */
const categoryQueryKey = (slug: string) => ["category", slug] as const;

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  validateSearch: categorySearchSchema,
  loader: async ({ params, context }) => {
    const category = await context.queryClient.ensureQueryData({
      queryKey: categoryQueryKey(params.slug),
      queryFn: () => fetchCatalogCategory(params.slug),
    });
    return { category };
  },
  head: ({ params, loaderData }) => {
    const category = loaderData?.category;
    const title = category ? `${category.name} — ${BRAND.name}` : `${params.slug} — ${BRAND.name}`;
    const description = category?.description?.trim() || BRAND.description;
    const image = category?.imageUrl || BRAND.ogImage;
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
  errorComponent: CategoryErrorComponent,
  notFoundComponent: CategoryNotFoundComponent,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { t, language } = useTranslation();

  const updateSearch = (patch: Partial<CategorySearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  };

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

  // Unfiltered baseline for this category — source of the manufacturer/country
  // facet options, independent of whichever filters are currently applied.
  const { data: facetSource } = useQuery({
    queryKey: ["category-facets", slug],
    queryFn: () => fetchCatalogCategoryFacetSource(slug),
    enabled: !!category,
  });

  // Stage 10's hierarchy fields (parentId) plus its pure getCategoryAncestry
  // helper, applied to the same flat category list the home page already
  // fetches — reused as-is here for subcategory tiles and breadcrumbs,
  // rather than adding a new tree/ancestry endpoint.
  const { data: allCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
  const subcategories = useMemo(
    () => (allCategories ?? []).filter((c) => c.parentId === category?.id),
    [allCategories, category?.id],
  );
  const ancestry = useMemo(
    () => (category ? getCategoryAncestry(allCategories ?? [], category.id) : []),
    [allCategories, category],
  );

  const manufacturerOptions = useMemo(() => {
    const values = (facetSource ?? []).map((p) => p.manufacturer).filter((v): v is string => !!v);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [facetSource]);

  const countryOptions = useMemo(() => {
    const values = (facetSource ?? [])
      .map((p) => p.countryOfOrigin)
      .filter((v): v is string => !!v);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [facetSource]);

  const [minPriceInput, setMinPriceInput] = useState(
    search.minPrice !== undefined ? String(search.minPrice) : "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    search.maxPrice !== undefined ? String(search.maxPrice) : "",
  );
  const debouncedMinPrice = useDebouncedValue(minPriceInput, 400);
  const debouncedMaxPrice = useDebouncedValue(maxPriceInput, 400);

  const minPrice = debouncedMinPrice.trim() ? Number(debouncedMinPrice) : undefined;
  const maxPrice = debouncedMaxPrice.trim() ? Number(debouncedMaxPrice) : undefined;

  // Same treatment as minPrice/maxPrice above: `search.q` only seeds the
  // initial value (deep-linkable), typing stays local+debounced and never
  // round-trips through the URL on every keystroke.
  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const debouncedSearchTerm = useDebouncedValue(searchInput.trim(), 300);

  // Этап №7 — controlled so the Android/browser hardware Back button closes
  // the mobile filter sheet first, instead of skipping over it.
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  useCloseOnBackButton(isFilterOpen, setIsFilterOpen);

  // useInfiniteQuery keys on category slug + every filter/sort value, so
  // changing any of them starts a fresh query from page one (same mechanism
  // as the home page's search — Stage 6 reuses it, doesn't invent a new
  // one) instead of appending to stale results from the previous selection.
  const {
    data,
    isLoading: productsLoading,
    isFetching: productsFetching,
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
      minPrice,
      maxPrice,
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
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
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
    [category?.name ?? "", ...ancestry.map((c) => c.name), ...subcategories.map((c) => c.name)],
    language,
  );
  const translateCategoryName = (name: string) =>
    language === DEFAULT_LANGUAGE ? name : (translations[name] ?? name);

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader showLanguageSwitcher safeAreaTop />
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
        <SiteHeader showLanguageSwitcher safeAreaTop />
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
  // total is the filtered-match count regardless of how many pages have
  // been fetched — every page of the same query reports the same value, so
  // the first is as good as any.
  const resultsCount = data?.pages[0]?.total ?? 0;
  const resultsCountLabel = t(
    resultsCount === 1 ? "category.resultsCountOne" : "category.resultsCountMany",
    { count: resultsCount },
  );

  const hasActiveFilters =
    !!search.inStockOnly ||
    search.minPrice !== undefined ||
    search.maxPrice !== undefined ||
    !!search.manufacturers?.length ||
    !!search.countriesOfOrigin?.length;

  const resetFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    void navigate({
      search: (prev) => ({ sortBy: prev.sortBy }),
      replace: true,
    });
  };

  const toggleFacet = (key: "manufacturers" | "countriesOfOrigin", value: string) => {
    const current = search[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    updateSearch({ [key]: next.length ? next : undefined });
  };

  // Shared between the always-visible desktop sidebar and the mobile bottom
  // sheet (Этап №1 мобильной навигации) — same controlled fields/state
  // either way, just two different containers so filters never drift apart.
  const filterFields = (
    <>
      <div className="space-y-2">
        <Label>{t("category.priceLabel")}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder={t("category.priceFromPlaceholder")}
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder={t("category.priceToPlaceholder")}
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={!!search.inStockOnly}
          onCheckedChange={(value) => updateSearch({ inStockOnly: value ? true : undefined })}
        />
        <span className="text-sm">{t("category.inStockOnlyLabel")}</span>
      </label>

      {manufacturerOptions.length > 0 && (
        <div className="space-y-2">
          <Label>{t("category.manufacturerLabel")}</Label>
          <div className="space-y-2">
            {manufacturerOptions.map((value) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={(search.manufacturers ?? []).includes(value)}
                  onCheckedChange={() => toggleFacet("manufacturers", value)}
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {countryOptions.length > 0 && (
        <div className="space-y-2">
          <Label>{t("category.countryLabel")}</Label>
          <div className="space-y-2">
            {countryOptions.map((value) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={(search.countriesOfOrigin ?? []).includes(value)}
                  onCheckedChange={() => toggleFacet("countriesOfOrigin", value)}
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Shared between the compact mobile row and the desktop results/sort row
  // (Этап №2) — same control, two layouts.
  const sortSelect = (
    <Select
      value={search.sortBy ?? "newest"}
      onValueChange={(value) =>
        updateSearch({
          sortBy: value === "newest" ? undefined : (value as ProductSortBy),
        })
      }
    >
      <SelectTrigger className="h-11 w-full lg:h-9 lg:w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">{t("category.sortNewest")}</SelectItem>
        <SelectItem value="popularity">{t("category.sortPopularity")}</SelectItem>
        <SelectItem value="price_asc">{t("category.sortPriceAsc")}</SelectItem>
        <SelectItem value="price_desc">{t("category.sortPriceDesc")}</SelectItem>
        <SelectItem value="name">{t("category.sortName")}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader showLanguageSwitcher safeAreaTop />
      <main className="flex-1 mx-auto max-w-7xl px-4 pt-4 pb-12 w-full sm:px-6 lg:pt-12">
        {/* Этап №2 — the whole header stack above the grid is deliberately
            compact on mobile (smaller heading, description hidden, single-row
            scrollable subcategories, tightened spacing) so the product grid
            itself is reached with minimal scrolling, per "user sees this
            category's products right away". Desktop keeps its original,
            more spacious layout untouched via `lg:` overrides. */}
        <Breadcrumb className="mb-3 lg:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t("category.breadcrumbHome")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t("nav.catalog")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {/* Stage 10's getCategoryAncestry supplies exactly this — one
                BreadcrumbItem + BreadcrumbSeparator pair per ancestor,
                root-first, however deep the chain actually is. */}
            {ancestry.map((ancestor) => (
              <Fragment key={ancestor.id}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/category/$slug" params={{ slug: ancestor.slug }}>
                      {translateCategoryName(ancestor.name)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </Fragment>
            ))}
            <BreadcrumbItem>
              <BreadcrumbPage>{displayName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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

        <div className="relative mt-4 max-w-md lg:mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            inputMode="search"
            placeholder={t("header.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-11 rounded-full pl-11 pr-5"
            aria-label={t("common.search")}
          />
        </div>

        <div className="mt-4 grid gap-8 lg:mt-10 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar — unchanged from before this stage, just hidden
              below `lg` so it no longer auto-displays on mobile (Этап №1). */}
          <aside className="hidden lg:block space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl">{t("category.filtersHeading")}</h2>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  {t("category.resetFiltersButton")}
                </Button>
              )}
            </div>
            {filterFields}
          </aside>

          <div>
            {/* Mobile-only compact controls row: results count on its own
                thin line, then Filter + Sort side by side — replaces two
                separate full-width rows from Этап №1 with one, so the grid
                below starts as close to the top as possible (Этап №2). */}
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
              {productsFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {!productsLoading && data && <span>{resultsCountLabel}</span>}
            </div>
            <div className="mb-4 flex items-center gap-2 lg:hidden">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 justify-center gap-2 rounded-full px-3"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("category.filterButton")}
                    {hasActiveFilters && (
                      <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
                  <SheetHeader className="flex-row items-center justify-between space-y-0">
                    <SheetTitle>{t("category.filtersHeading")}</SheetTitle>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={resetFilters} className="mr-6">
                        {t("category.resetFiltersButton")}
                      </Button>
                    )}
                  </SheetHeader>
                  <div className="mt-6 space-y-6">{filterFields}</div>
                  <SheetFooter className="mt-6">
                    <SheetClose asChild>
                      <Button size="lg" className="w-full rounded-full h-12">
                        {t("category.showResultsButton")}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              <div className="flex-1">{sortSelect}</div>
            </div>

            {/* Desktop results/sort row — unchanged from before this stage. */}
            <div className="hidden items-center justify-between mb-6 gap-4 lg:flex">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {productsFetching && <Loader2 className="h-4 w-4 animate-spin" />}
                {!productsLoading && data && <span>{resultsCountLabel}</span>}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">
                  {t("category.sortLabel")}
                </Label>
                {sortSelect}
              </div>
            </div>

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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
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
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

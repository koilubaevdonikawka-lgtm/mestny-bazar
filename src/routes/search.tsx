import { createFileRoute, Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, Home, Loader2, Search, ShoppingBasket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { listProducts } from "@/api/catalog";
import { listCategories } from "@/api/category";
import { useSearchStore } from "@/stores/searchStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { BRAND } from "@/config/brand";
import type { CategoryDTO } from "@shared/contracts/catalog";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

/**
 * Whole catalog loaded up front (single request, no cursor pagination) and
 * filtered/sorted entirely client-side. Deliberate for the current scale —
 * a handful of products total (checked directly against production before
 * building this) — not a general-purpose pattern; revisit with real
 * server-side pagination/virtualization if the catalog grows into the
 * hundreds+.
 */
const ALL_PRODUCTS_PAGE_SIZE = 500;

interface CategoryPath {
  top: CategoryDTO | null;
  sub: CategoryDTO | null;
}

function resolveCategoryPath(
  categoryId: string | null,
  categoriesById: Map<string, CategoryDTO>,
): CategoryPath {
  if (!categoryId) return { top: null, sub: null };
  const category = categoriesById.get(categoryId);
  if (!category) return { top: null, sub: null };
  if (!category.parentId) return { top: category, sub: null };
  const parent = categoriesById.get(category.parentId) ?? null;
  return { top: parent, sub: category };
}

function SearchPage() {
  const { t, language } = useTranslation();
  const { search, setSearch } = useSearchStore();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const { data: productResult, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "search-page-all"],
    queryFn: () => listProducts({ sortBy: "name", pageSize: ALL_PRODUCTS_PAGE_SIZE }),
    staleTime: 60 * 1000,
  });
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categoriesById = useMemo(() => {
    const map = new Map<string, CategoryDTO>();
    for (const c of categories ?? []) map.set(c.id, c);
    return map;
  }, [categories]);

  const rows = useMemo(() => {
    const products = productResult?.items ?? [];
    return products.map((product) => ({
      product,
      path: resolveCategoryPath(product.categoryId, categoriesById),
    }));
  }, [productResult, categoriesById]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    return rows.filter(({ product, path }) => {
      const haystack = [product.name, path.top?.name, path.sub?.name]
        .filter((v): v is string => Boolean(v))
        .join(" ")
        .toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [rows, debouncedSearch]);

  const translations = useTranslatedTexts(
    [...rows.map((r) => r.product.name), ...(categories ?? []).map((c) => c.name)],
    language,
  );
  const displayText = (raw: string) =>
    language === DEFAULT_LANGUAGE ? raw : (translations[raw] ?? raw);

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showSearch={false} cartIconOnly />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        {/* [Назад] [Home] */}
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                void router.navigate({ to: "/" });
              }
            }}
            className="flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </button>
          <Link
            to="/"
            className="flex h-10 items-center gap-1 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Home className="h-4 w-4" />
            {t("common.home")}
          </Link>
        </div>

        {/* Поисковая панель */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            inputMode="search"
            autoFocus
            placeholder={t("header.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full pl-11 pr-5 text-base"
            aria-label={t("header.searchPlaceholder")}
          />
        </div>

        {/* Вертикальный список: Категория > Подкатегория > Товар */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBasket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-serif text-2xl">{t("home.noResultsTitle")}</h3>
            {debouncedSearch && (
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                {t("home.noResultsDescription", { query: search.trim() })}
              </p>
            )}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
            {filteredRows.map(({ product, path }) => (
              <li key={product.id}>
                <Link
                  to="/product/$handle"
                  params={{ handle: product.slug }}
                  className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-secondary sm:px-5"
                >
                  <span className="text-xs text-muted-foreground">
                    {[path.top, path.sub]
                      .filter((c): c is CategoryDTO => Boolean(c))
                      .map((c) => displayText(c.name))
                      .join(" > ")}
                  </span>
                  <span className="text-sm font-medium sm:text-base">
                    {displayText(product.name)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

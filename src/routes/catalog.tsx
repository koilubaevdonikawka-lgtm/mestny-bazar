import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listCategories } from "@/api/category";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { BRAND } from "@/config/brand";

/**
 * Second step toward the mobile bottom-tab-bar navigation
 * (Главная/Каталог/Корзина/Профиль, see src/routes/cart.tsx for the first
 * step) — a real, standalone /catalog route listing every top-level
 * category as a direct link to its own page, using listCategories() (same
 * query the home page's own top-nav row already uses) and the same card
 * visual design as SubcategoryCard/SubcategoryGrid (copied here, not
 * imported: that component's Link target is hardcoded to the nested
 * subcategory route, /category/$categorySlug/subcategory/$subcategorySlug
 * — wrong shape for a plain top-level category — and this task's scope is
 * this new file only). The home page's own category section (select-a-
 * category-inline-then-drill-into-its-subcategories) is untouched; this is
 * an additional, separate entry point, same as /cart is for the cart Sheet.
 */
export const Route = createFileRoute("/catalog")({
  component: CatalogPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function CatalogPage() {
  const { t, language } = useTranslation();

  // Same query/staleTime as the home page's own top-nav row — categories
  // change rarely, one unpaginated fetch is enough.
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });
  const topLevelCategories = useMemo(
    () => (categories ?? []).filter((c) => c.parentId === null),
    [categories],
  );
  const nameTranslations = useTranslatedTexts(
    topLevelCategories.map((c) => c.name),
    language,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6">
        <h1 className="font-serif text-2xl tracking-tight">{t("nav.categories")}</h1>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
          {topLevelCategories.map((category) => {
            const displayName =
              language === DEFAULT_LANGUAGE
                ? category.name
                : (nameTranslations[category.name] ?? category.name);
            return (
              <Link
                key={category.id}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card text-center transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] hover:border-primary/40"
              >
                <div className="aspect-square w-full overflow-hidden rounded-t-2xl bg-secondary/40">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
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
                <div className="px-4 pt-2 pb-4 font-serif text-base leading-tight text-primary line-clamp-2">
                  {displayName}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

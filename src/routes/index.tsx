import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useResetOnAppForeground } from "@/hooks/useResetOnAppForeground";
import { listCategories } from "@/api/category";
import { listActiveBanners } from "@/api/design";
import { useTranslation } from "@/i18n/LanguageProvider";
import { DEFAULT_LANGUAGE } from "@/i18n/languages";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { SubcategoryGrid } from "@/components/home/SubcategoryGrid";
import { WelcomeGate } from "@/components/WelcomeGate";
import { useCategoryStore } from "@/stores/categoryStore";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Categories change rarely — a single unpaginated fetch, cached for a
  // while, is enough.
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
  const selectedCategoryId = useCategoryStore((s) => s.activeCategoryId);
  const setSelectedCategoryId = useCategoryStore((s) => s.setActiveCategoryId);
  // App returning from background (PWA/native) should land back on the
  // default (leftmost) category, not silently keep whatever was selected
  // before backgrounding — resetting to null re-derives defaultCategoryId
  // below, same as a genuine first visit. Doesn't touch searchStore,
  // cartStore, or checkoutStore — only this one piece of state.
  useResetOnAppForeground(() => setSelectedCategoryId(null));
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
  // text this page displays (category names, active banner) — Промпт №097.
  const pageTranslations = useTranslatedTexts(
    [
      // All categories (not just top-level) — the second nav row below
      // shows whichever category's subcategories are active, so their names
      // need to already be translated, not just the first-selected one's.
      ...(categories ?? []).map((c) => c.name),
      ...(banner ? [banner.title, ...(banner.subtitle ? [banner.subtitle] : [])] : []),
    ],
    language,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeGate />
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />

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

      {/* Баннер — единственное, что осталось в этой секции: логотип/название
          бренда убраны из шапки главной страницы (Этап: "Информация" в
          шапке вместо логотипа/футера) — теперь доступны через модалку
          "Информация" в SiteHeader, а не отдельным блоком здесь. */}
      <section className="relative overflow-hidden">
        {banner && (
          <div className="mx-auto max-w-4xl px-6 pt-6 pb-16 sm:pt-10">
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

      {/* Подкатегории выбранной основной категории — вертикальной сеткой
          (2 колонки, своя прокрутка), под панелью категорий/баннером.
          Клик по подкатегории ведёт на отдельную страницу товаров
          (/category/$categorySlug/subcategory/$subcategorySlug), не на
          общий /category/$slug — Этап: трёхуровневая навигация.
          Обновляется при выборе другой основной категории в панели выше
          (activeSubcategories пересчитывается от activeCategoryId). */}
      {activeCategory && activeSubcategories.length > 0 && (
        <section className="mx-auto max-w-7xl px-3 py-8 w-full sm:px-6 sm:py-12">
          {/* Заголовок с названием категории убран — дублировал уже
              выбранную (подсвеченную зелёным) кнопку в панели категорий
              выше (задача: "удалить дублирующее описание категории"). */}
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
    </div>
  );
}

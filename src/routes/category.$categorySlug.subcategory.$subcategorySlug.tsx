import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/config/brand";
import { fetchCatalogCategory } from "@/lib/catalog";
import {
  CategoryErrorComponent,
  CategoryNotFoundComponent,
  ProductPage,
  categoryQueryKey,
  categorySearchSchema,
} from "@/components/category/ProductPage";

/**
 * Страница товаров подкатегории — Этап: трёхуровневая навигация.
 * Отдельный URL от `/category/$slug`, но та же логика товаров/фильтров
 * (`ProductPage`, см. этот компонент): категория и подкатегория — одна
 * сущность (`categories.slug` глобально уникален), поэтому запрос к
 * товарам идентичен для обоих маршрутов — не дублируется, а переиспользуется
 * через общий компонент.
 */
export const Route = createFileRoute("/category/$categorySlug/subcategory/$subcategorySlug")({
  component: SubcategoryProductPage,
  validateSearch: categorySearchSchema,
  loader: async ({ params, context }) => {
    const category = await context.queryClient.ensureQueryData({
      queryKey: categoryQueryKey(params.subcategorySlug),
      queryFn: () => fetchCatalogCategory(params.subcategorySlug),
    });
    return { category };
  },
  head: ({ params, loaderData }) => {
    const category = loaderData?.category;
    const title = category
      ? `${category.name} — ${BRAND.name}`
      : `${params.subcategorySlug} — ${BRAND.name}`;
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

function SubcategoryProductPage() {
  const { subcategorySlug } = Route.useParams();
  const search = Route.useSearch();

  return <ProductPage slug={subcategorySlug} search={search} />;
}

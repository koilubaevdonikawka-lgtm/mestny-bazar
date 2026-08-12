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

  return <ProductPage slug={slug} search={search} />;
}

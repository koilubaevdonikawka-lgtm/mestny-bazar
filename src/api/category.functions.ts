import { createServerFn } from "@tanstack/react-start";
import type { CategoryDTO } from "@shared/contracts/catalog";
import { categorySlugParamSchema } from "@shared/validation/catalog.schema";

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryDTO[]> => {
    const { getServices } = await import("@server/di/container");
    return getServices().categories.listCategories();
  },
);

export const getCategoryBySlugFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => categorySlugParamSchema.parse(data))
  .handler(async ({ data }): Promise<CategoryDTO | null> => {
    const { getServices } = await import("@server/di/container");
    return getServices().categories.getCategoryBySlug(data.slug);
  });

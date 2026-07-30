import { createServerFn } from "@tanstack/react-start";
import type { CategoryDTO } from "@shared/contracts/catalog";

export const listCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryDTO[]> => {
    const { getServices } = await import("@server/di/container");
    return getServices().categories.listCategories();
  },
);

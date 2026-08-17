import { createServerFn } from "@tanstack/react-start";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";
import {
  createCategoryRequestSchema,
  updateCategoryRequestSchema,
} from "@shared/validation/category-admin.schema";
import { uuidParamSchema } from "@shared/validation/common.schema";

export const listAdminCategoriesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminCategoryDTO[]> => {
    const { executeListAdminCategories } =
      await import("@server/functions/category-admin.executor");
    return executeListAdminCategories();
  },
);

export const createCategoryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createCategoryRequestSchema.parse(data))
  .handler(async ({ data }): Promise<AdminCategoryDTO> => {
    const { executeCreateCategory } = await import("@server/functions/category-admin.executor");
    return executeCreateCategory(data);
  });

export const updateCategoryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateCategoryRequestSchema.parse(data))
  .handler(async ({ data }): Promise<AdminCategoryDTO> => {
    const { executeUpdateCategory } = await import("@server/functions/category-admin.executor");
    return executeUpdateCategory(data);
  });

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uuidParamSchema.parse(data))
  .handler(async ({ data }): Promise<void> => {
    const { executeDeleteCategory } = await import("@server/functions/category-admin.executor");
    return executeDeleteCategory(data.id);
  });

import type {
  AdminCategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/contracts/category-admin";
import {
  createCategoryFn,
  deleteCategoryFn,
  listAdminCategoriesFn,
  updateCategoryFn,
} from "@/api/category-admin.functions";

export async function listAdminCategories(): Promise<AdminCategoryDTO[]> {
  return listAdminCategoriesFn();
}

export async function createCategory(request: CreateCategoryRequest): Promise<AdminCategoryDTO> {
  return createCategoryFn({ data: request });
}

export async function updateCategory(request: UpdateCategoryRequest): Promise<AdminCategoryDTO> {
  return updateCategoryFn({ data: request });
}

export async function deleteCategory(id: string): Promise<void> {
  return deleteCategoryFn({ data: { id } });
}

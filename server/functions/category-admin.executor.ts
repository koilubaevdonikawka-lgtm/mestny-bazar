import type {
  AdminCategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/contracts/category-admin";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListAdminCategories(): Promise<AdminCategoryDTO[]> {
  await requireAdminFromRequest();
  return getServices().categoryAdminService.listCategories();
}

export async function executeCreateCategory(
  data: CreateCategoryRequest,
): Promise<AdminCategoryDTO> {
  await requireAdminFromRequest();
  return getServices().categoryAdminService.createCategory(data);
}

export async function executeUpdateCategory(
  data: UpdateCategoryRequest,
): Promise<AdminCategoryDTO> {
  await requireAdminFromRequest();
  return getServices().categoryAdminService.updateCategory(data);
}

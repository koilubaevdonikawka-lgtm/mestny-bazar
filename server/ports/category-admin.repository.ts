import type {
  AdminCategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/contracts/category-admin";

export interface IAdminCategoryRepository {
  /** All categories, active and inactive — unlike ICategoryRepository (customer-facing). */
  listAll(): Promise<AdminCategoryDTO[]>;
  getById(id: string): Promise<AdminCategoryDTO | null>;
  create(data: CreateCategoryRequest & { slug: string }): Promise<AdminCategoryDTO>;
  update(data: UpdateCategoryRequest): Promise<AdminCategoryDTO>;
  slugExists(slug: string, exceptId?: string): Promise<boolean>;
}

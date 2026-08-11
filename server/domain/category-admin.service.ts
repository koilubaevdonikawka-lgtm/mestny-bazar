import type {
  AdminCategoryDTO,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@shared/contracts/category-admin";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import {
  CategoryHasChildrenError,
  CategoryNotFoundError,
  CategoryValidationError,
} from "@server/domain/category-admin.errors";
import { slugify } from "@shared/lib/slugify";

/** Category CRUD — new for the Admin Platform (catalog.md); mirrors SellerProductService's shape. */
export class CategoryAdminService {
  constructor(
    private readonly categories: IAdminCategoryRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listCategories(): Promise<AdminCategoryDTO[]> {
    return this.categories.listAll();
  }

  async createCategory(data: CreateCategoryRequest): Promise<AdminCategoryDTO> {
    this.validateName(data.name);
    if (data.parentId !== undefined) {
      await this.assertValidParent(data.parentId, undefined);
    }
    const slug = await this.resolveUniqueSlug(data.slug?.trim() || slugify(data.name, "category"));

    const category = await this.categories.create({ ...data, slug });
    await this.events.publish({ type: "category.created", category });
    return category;
  }

  async updateCategory(data: UpdateCategoryRequest): Promise<AdminCategoryDTO> {
    const existing = await this.categories.getById(data.id);
    if (!existing) throw new CategoryNotFoundError();

    if (data.name !== undefined) this.validateName(data.name);
    if (data.parentId !== undefined) {
      await this.assertValidParent(data.parentId, data.id);
    }

    let patch = { ...data };
    if (data.slug !== undefined) {
      patch = { ...patch, slug: await this.resolveUniqueSlug(data.slug.trim(), data.id) };
    }

    const category = await this.categories.update(patch);
    await this.events.publish({ type: "category.updated", category });
    return category;
  }

  /**
   * Deletion is blocked while the category still has subcategories — the FK
   * (parent_id ON DELETE SET NULL) would otherwise silently promote them to
   * top-level, collapsing the hierarchy without confirmation. Products that
   * reference this category are intentionally NOT checked here: the same FK
   * sets their category_id to null on delete (no row is destroyed, no data
   * lost — an admin can reassign them afterward), matching how the schema
   * itself was designed for this case (see category_hierarchy migration).
   */
  async deleteCategory(id: string): Promise<void> {
    const existing = await this.categories.getById(id);
    if (!existing) throw new CategoryNotFoundError();

    const all = await this.categories.listAll();
    if (all.some((c) => c.parentId === id)) {
      throw new CategoryHasChildrenError();
    }

    await this.categories.delete(id);
    await this.events.publish({ type: "category.deleted", categoryId: id, name: existing.name });
  }

  private async resolveUniqueSlug(baseSlug: string, exceptId?: string): Promise<string> {
    if (!baseSlug) {
      throw new CategoryValidationError("Slug is required", "slug");
    }
    if (!(await this.categories.slugExists(baseSlug, exceptId))) return baseSlug;

    for (let i = 2; i <= 20; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await this.categories.slugExists(candidate, exceptId))) return candidate;
    }
    return `${baseSlug}-${Date.now()}`;
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new CategoryValidationError("Name must be at least 2 characters", "name");
    }
  }

  /**
   * Direct self-parenting and a nonexistent parent are rejected here with a
   * friendly error instead of surfacing as a raw FK-violation from Postgres
   * (mirrors SellerProductService.assertCategoryExists for products).
   * Multi-hop cycles (A -> B -> A) are not checked here — see the migration
   * comment; buildCategoryTree/getCategoryAncestry handle that defensively
   * on read instead of paying for a full ancestry walk on every write.
   */
  private async assertValidParent(
    parentId: string | null,
    selfId: string | undefined,
  ): Promise<void> {
    if (parentId === null) return;
    if (parentId === selfId) {
      throw new CategoryValidationError("A category cannot be its own parent", "parentId");
    }
    const parent = await this.categories.getById(parentId);
    if (!parent) {
      throw new CategoryValidationError("Parent category not found", "parentId");
    }
  }
}

import type { AdminCategoryDTO, UpdateCategoryRequest } from "@shared/contracts/category-admin";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  name_kg: string | null;
  parent_id: string | null;
}

export function mapAdminCategoryRow(row: CategoryRow): AdminCategoryDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    nameKg: row.name_kg,
    parentId: row.parent_id,
  };
}

const CATEGORY_SELECT =
  "id, name, slug, description, image_url, sort_order, is_active, name_kg, parent_id";

/** Admin-facing category repository — sees active and inactive categories, unlike SupabaseCategoryRepository. */
export class SupabaseAdminCategoryRepository implements IAdminCategoryRepository {
  async listAll(): Promise<AdminCategoryDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(CATEGORY_SELECT)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list categories: ${error.message}`);
    return (data ?? []).map(mapAdminCategoryRow);
  }

  async getById(id: string): Promise<AdminCategoryDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch category: ${error.message}`);
    return data ? mapAdminCategoryRow(data) : null;
  }

  async create(data: Parameters<IAdminCategoryRepository["create"]>[0]): Promise<AdminCategoryDTO> {
    const parentId = data.parentId ?? null;
    const sortOrder = data.sortOrder ?? (await this.nextSortOrder(parentId));

    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image_url: data.imageUrl ?? null,
        sort_order: sortOrder,
        is_active: data.isActive ?? true,
        name_kg: data.nameKg ?? null,
        parent_id: parentId,
      })
      .select(CATEGORY_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create category: ${error?.message ?? "unknown"}`);
    return mapAdminCategoryRow(row);
  }

  /**
   * A new category with no explicit sort_order goes to the end of its
   * sibling group (same parent_id — NULL for top-level), not sort_order 0.
   * 0 previously meant every category created without an explicit order
   * jumped ahead of the entire existing list — confirmed live: a category
   * added via the admin panel this way ("Строй материялы", sort_order 0)
   * displaced the intended first category on the homepage's top-level row.
   */
  private async nextSortOrder(parentId: string | null): Promise<number> {
    let query = supabaseAdmin
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId);

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to compute next category sort order: ${error.message}`);
    return (data?.sort_order ?? -1) + 1;
  }

  async update(data: UpdateCategoryRequest): Promise<AdminCategoryDTO> {
    const patch: {
      name?: string;
      slug?: string;
      description?: string | null;
      image_url?: string | null;
      sort_order?: number;
      is_active?: boolean;
      name_kg?: string | null;
      parent_id?: string | null;
    } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.description !== undefined) patch.description = data.description;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    if (data.nameKg !== undefined) patch.name_kg = data.nameKg;
    if (data.parentId !== undefined) patch.parent_id = data.parentId;

    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .update(patch)
      .eq("id", data.id)
      .select(CATEGORY_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to update category: ${error?.message ?? "unknown"}`);
    return mapAdminCategoryRow(row);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }

  async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("categories").select("id").eq("slug", slug);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`Failed to check category slug: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
}

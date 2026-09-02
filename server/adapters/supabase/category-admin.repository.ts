import type { AdminCategoryDTO, UpdateCategoryRequest } from "@shared/contracts/category-admin";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order_text: string;
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
    sortOrder: row.sort_order_text,
    isActive: row.is_active,
    nameKg: row.name_kg,
    parentId: row.parent_id,
  };
}

// Задача №232 — selects sort_order_text (a generated text mirror of the
// real numeric sort_order column), never the raw numeric column itself —
// see the migration comment for why (JSON.parse precision loss avoidance).
const CATEGORY_SELECT =
  "id, name, slug, description, image_url, sort_order_text, is_active, name_kg, parent_id";

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
   *
   * Задача №232 — now delegates to the next_subcategory_sort_order SQL
   * function (real Postgres numeric MAX() scoped by parent_id, cast to
   * text) instead of SELECTing the raw numeric column and doing `+1` in
   * JS: after sort_order became NUMERIC (unbounded precision), the old
   * JS-side approach would have been just as precision-lossy as computing
   * a product's next value in JS — see the products migration for the
   * full JSON.parse explanation.
   */
  private async nextSortOrder(parentId: string | null): Promise<string> {
    const { data, error } = await supabaseAdmin.rpc("next_subcategory_sort_order", {
      p_parent_id: parentId,
    });
    if (error) throw new Error(`Failed to compute next category sort order: ${error.message}`);
    return data;
  }

  /**
   * Задача №232 — soft (not DB-enforced) duplicate check, scoped to
   * siblings of the same parent_id: two categories/subcategories under
   * DIFFERENT parents sharing the same sort_order is normal (variant Б),
   * not a conflict — only matches within the same parent group. NULL-safe
   * for parentId (top-level categories all share `parent_id IS NULL`).
   */
  async findBySortOrder(
    sortOrder: string,
    parentId: string | null,
    exceptId?: string,
  ): Promise<{ id: string; name: string } | null> {
    let query = supabaseAdmin.from("categories").select("id, name").eq("sort_order", sortOrder);
    query = parentId === null ? query.is("parent_id", null) : query.eq("parent_id", parentId);
    if (exceptId) query = query.neq("id", exceptId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to check category sort order: ${error.message}`);
    return data ?? null;
  }

  async update(data: UpdateCategoryRequest): Promise<AdminCategoryDTO> {
    const patch: {
      name?: string;
      slug?: string;
      description?: string | null;
      image_url?: string | null;
      sort_order?: string;
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

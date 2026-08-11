import type { CategoryDTO } from "@shared/contracts/catalog";
import type { ICategoryRepository } from "@server/ports/category.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

function mapCategory(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  name_kg: string | null;
  parent_id: string | null;
}): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    nameKg: row.name_kg,
    parentId: row.parent_id,
  };
}

const CATEGORY_SELECT = "id, name, slug, description, image_url, sort_order, name_kg, parent_id";

/** Supabase category repository — buyers see active categories only. */
export class SupabaseCategoryRepository implements ICategoryRepository {
  async list(): Promise<CategoryDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list categories: ${error.message}`);
    return (data ?? []).map(mapCategory);
  }

  async getBySlug(slug: string): Promise<CategoryDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(CATEGORY_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch category by slug: ${error.message}`);
    return data ? mapCategory(data) : null;
  }
}

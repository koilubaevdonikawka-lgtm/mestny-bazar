import type {
  AttributeDTO,
  AttributeGroupDTO,
  AttributeValueOptionDTO,
  AttributeValueType,
  CategoryAttributeLinkDTO,
  CreateAttributeGroupRequest,
  CreateAttributeRequest,
  CreateAttributeValueOptionRequest,
  LinkAttributeToCategoryRequest,
  UpdateAttributeGroupRequest,
  UpdateAttributeRequest,
} from "@shared/contracts/product-attributes";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface AttributeGroupRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

interface AttributeRow {
  id: string;
  group_id: string | null;
  name: string;
  slug: string;
  value_type: AttributeValueType;
  unit: string | null;
  sort_order: number;
  is_active: boolean;
  is_filterable: boolean;
}

interface AttributeValueRow {
  id: string;
  attribute_id: string;
  value: string;
  sort_order: number;
}

interface CategoryAttributeRow {
  category_id: string;
  attribute_id: string;
  is_required: boolean;
  sort_order: number;
}

export function mapAttributeGroupRow(row: AttributeGroupRow): AttributeGroupDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapAttributeRow(row: AttributeRow): AttributeDTO {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    slug: row.slug,
    valueType: row.value_type,
    unit: row.unit,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    isFilterable: row.is_filterable,
  };
}

export function mapAttributeValueRow(row: AttributeValueRow): AttributeValueOptionDTO {
  return {
    id: row.id,
    attributeId: row.attribute_id,
    value: row.value,
    sortOrder: row.sort_order,
  };
}

export function mapCategoryAttributeRow(row: CategoryAttributeRow): CategoryAttributeLinkDTO {
  return {
    categoryId: row.category_id,
    attributeId: row.attribute_id,
    isRequired: row.is_required,
    sortOrder: row.sort_order,
  };
}

const GROUP_SELECT = "id, name, slug, sort_order, is_active";
const ATTRIBUTE_SELECT =
  "id, group_id, name, slug, value_type, unit, sort_order, is_active, is_filterable";
const VALUE_OPTION_SELECT = "id, attribute_id, value, sort_order";
const CATEGORY_ATTRIBUTE_SELECT = "category_id, attribute_id, is_required, sort_order";

export class SupabaseAttributeRepository implements IAttributeRepository {
  async listGroups(): Promise<AttributeGroupDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("attribute_groups")
      .select(GROUP_SELECT)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list attribute groups: ${error.message}`);
    return (data ?? []).map(mapAttributeGroupRow);
  }

  async getGroupById(id: string): Promise<AttributeGroupDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("attribute_groups")
      .select(GROUP_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch attribute group: ${error.message}`);
    return data ? mapAttributeGroupRow(data) : null;
  }

  async createGroup(
    data: CreateAttributeGroupRequest & { slug: string },
  ): Promise<AttributeGroupDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("attribute_groups")
      .insert({
        name: data.name,
        slug: data.slug,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
      })
      .select(GROUP_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create attribute group: ${error?.message ?? "unknown"}`);
    return mapAttributeGroupRow(row);
  }

  async updateGroup(data: UpdateAttributeGroupRequest): Promise<AttributeGroupDTO> {
    const patch: { name?: string; slug?: string; sort_order?: number; is_active?: boolean } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;

    const { data: row, error } = await supabaseAdmin
      .from("attribute_groups")
      .update(patch)
      .eq("id", data.id)
      .select(GROUP_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update attribute group: ${error?.message ?? "unknown"}`);
    return mapAttributeGroupRow(row);
  }

  async groupSlugExists(slug: string, exceptId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("attribute_groups").select("id").eq("slug", slug);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`Failed to check attribute group slug: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  async listAttributes(): Promise<AttributeDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("attributes")
      .select(ATTRIBUTE_SELECT)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list attributes: ${error.message}`);
    return (data ?? []).map(mapAttributeRow);
  }

  async getAttributeById(id: string): Promise<AttributeDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("attributes")
      .select(ATTRIBUTE_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch attribute: ${error.message}`);
    return data ? mapAttributeRow(data) : null;
  }

  async createAttribute(data: CreateAttributeRequest & { slug: string }): Promise<AttributeDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("attributes")
      .insert({
        group_id: data.groupId ?? null,
        name: data.name,
        slug: data.slug,
        value_type: data.valueType,
        unit: data.unit ?? null,
        sort_order: data.sortOrder ?? 0,
        is_active: data.isActive ?? true,
        is_filterable: data.isFilterable ?? true,
      })
      .select(ATTRIBUTE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create attribute: ${error?.message ?? "unknown"}`);
    return mapAttributeRow(row);
  }

  async updateAttribute(data: UpdateAttributeRequest): Promise<AttributeDTO> {
    const patch: {
      group_id?: string | null;
      name?: string;
      slug?: string;
      unit?: string | null;
      sort_order?: number;
      is_active?: boolean;
      is_filterable?: boolean;
    } = {};
    if (data.groupId !== undefined) patch.group_id = data.groupId;
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    if (data.isFilterable !== undefined) patch.is_filterable = data.isFilterable;

    const { data: row, error } = await supabaseAdmin
      .from("attributes")
      .update(patch)
      .eq("id", data.id)
      .select(ATTRIBUTE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update attribute: ${error?.message ?? "unknown"}`);
    return mapAttributeRow(row);
  }

  async attributeSlugExists(slug: string, exceptId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("attributes").select("id").eq("slug", slug);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`Failed to check attribute slug: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  async listValueOptions(attributeId: string): Promise<AttributeValueOptionDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("attribute_values")
      .select(VALUE_OPTION_SELECT)
      .eq("attribute_id", attributeId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list attribute value options: ${error.message}`);
    return (data ?? []).map(mapAttributeValueRow);
  }

  async createValueOption(
    data: CreateAttributeValueOptionRequest,
  ): Promise<AttributeValueOptionDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("attribute_values")
      .insert({
        attribute_id: data.attributeId,
        value: data.value,
        sort_order: data.sortOrder ?? 0,
      })
      .select(VALUE_OPTION_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create attribute value option: ${error?.message ?? "unknown"}`);
    return mapAttributeValueRow(row);
  }

  async listAttributesForCategory(categoryId: string): Promise<CategoryAttributeLinkDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("category_attributes")
      .select(CATEGORY_ATTRIBUTE_SELECT)
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list category attributes: ${error.message}`);
    return (data ?? []).map(mapCategoryAttributeRow);
  }

  async linkAttributeToCategory(
    data: LinkAttributeToCategoryRequest,
  ): Promise<CategoryAttributeLinkDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("category_attributes")
      .upsert(
        {
          category_id: data.categoryId,
          attribute_id: data.attributeId,
          is_required: data.isRequired ?? false,
          sort_order: data.sortOrder ?? 0,
        },
        { onConflict: "category_id,attribute_id" },
      )
      .select(CATEGORY_ATTRIBUTE_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to link attribute to category: ${error?.message ?? "unknown"}`);
    return mapCategoryAttributeRow(row);
  }

  async unlinkAttributeFromCategory(categoryId: string, attributeId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("category_attributes")
      .delete()
      .eq("category_id", categoryId)
      .eq("attribute_id", attributeId);

    if (error) throw new Error(`Failed to unlink attribute from category: ${error.message}`);
  }
}

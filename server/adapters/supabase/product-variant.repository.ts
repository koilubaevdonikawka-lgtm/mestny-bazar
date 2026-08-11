import type {
  CreateProductVariantRequest,
  ProductVariantDTO,
  UpdateProductVariantRequest,
} from "@shared/contracts/product-variant";
import type { ProductPublicationStatus } from "@shared/contracts/seller-product";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  price: number | null;
  image_url: string | null;
  publication_status: ProductPublicationStatus;
  sort_order: number;
}

export function mapProductVariantRow(row: ProductVariantRow): ProductVariantDTO {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    price: row.price,
    imageUrl: row.image_url,
    publicationStatus: row.publication_status,
    sortOrder: row.sort_order,
  };
}

const SELECT = "id, product_id, sku, price, image_url, publication_status, sort_order";

export class SupabaseProductVariantRepository implements IProductVariantRepository {
  async listForProduct(productId: string): Promise<ProductVariantDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select(SELECT)
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(`Failed to list product variants: ${error.message}`);
    return (data ?? []).map(mapProductVariantRow);
  }

  async getById(id: string): Promise<ProductVariantDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select(SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch product variant: ${error.message}`);
    return data ? mapProductVariantRow(data) : null;
  }

  async create(data: CreateProductVariantRequest): Promise<ProductVariantDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: data.productId,
        sku: data.sku,
        price: data.price ?? null,
        image_url: data.imageUrl ?? null,
        publication_status: data.publicationStatus ?? "DRAFT",
        sort_order: data.sortOrder ?? 0,
      })
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to create product variant: ${error?.message ?? "unknown"}`);
    return mapProductVariantRow(row);
  }

  async update(data: UpdateProductVariantRequest): Promise<ProductVariantDTO> {
    const patch: {
      sku?: string;
      price?: number | null;
      image_url?: string | null;
      publication_status?: ProductPublicationStatus;
      sort_order?: number;
    } = {};
    if (data.sku !== undefined) patch.sku = data.sku;
    if (data.price !== undefined) patch.price = data.price;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.publicationStatus !== undefined) patch.publication_status = data.publicationStatus;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;

    const { data: row, error } = await supabaseAdmin
      .from("product_variants")
      .update(patch)
      .eq("id", data.id)
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update product variant: ${error?.message ?? "unknown"}`);
    return mapProductVariantRow(row);
  }

  async skuExists(sku: string, exceptId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("product_variants").select("id").eq("sku", sku);
    if (exceptId) query = query.neq("id", exceptId);

    const { data, error } = await query.limit(1);
    if (error) throw new Error(`Failed to check variant sku: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }
}

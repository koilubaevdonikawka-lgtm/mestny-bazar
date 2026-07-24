import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { ProductPublicationStatus as Status } from "@shared/contracts/seller-product";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

const PRODUCT_SELECT =
  "id, name, slug, description, price, currency, unit, image_url, stock, publication_status, category_id, seller_id";

function mapRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  image_url: string | null;
  stock: number;
  publication_status: ProductPublicationStatus;
  category_id: string | null;
}): SellerProductDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    unit: row.unit,
    imageUrl: row.image_url,
    stock: Number(row.stock),
    publicationStatus: row.publication_status,
    categoryId: row.category_id,
  };
}

function isActiveForCatalog(status: ProductPublicationStatus): boolean {
  return status === Status.PUBLISHED;
}

export class SupabaseSellerProductRepository implements ISellerProductRepository {
  async listBySeller(sellerId: string): Promise<SellerProductDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list seller products: ${error.message}`);
    return (data ?? []).map(mapRow);
  }

  async getById(id: string, sellerId: string): Promise<SellerProductDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .eq("seller_id", sellerId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch seller product: ${error.message}`);
    return data ? mapRow(data) : null;
  }

  async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    let query = supabaseAdmin.from("products").select("id").eq("slug", slug);
    if (exceptId) query = query.neq("id", exceptId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to check slug: ${error.message}`);
    return !!data;
  }

  async create(sellerId: string, data: CreateSellerProductRequest): Promise<SellerProductDTO> {
    const status = Status.DRAFT;
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .insert({
        seller_id: sellerId,
        name: data.name,
        slug: data.slug!,
        description: data.description ?? null,
        price: data.price,
        currency: data.currency ?? "KGS",
        unit: data.unit ?? null,
        image_url: data.imageUrl ?? null,
        stock: data.stock ?? 0,
        publication_status: status,
        is_active: isActiveForCatalog(status),
        category_id: data.categoryId ?? null,
      })
      .select(PRODUCT_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to create product: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }

  async update(sellerId: string, data: UpdateSellerProductRequest): Promise<SellerProductDTO> {
    const patch: TablesUpdate<"products"> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.description !== undefined) patch.description = data.description;
    if (data.price !== undefined) patch.price = data.price;
    if (data.currency !== undefined) patch.currency = data.currency;
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.stock !== undefined) patch.stock = data.stock;
    if (data.categoryId !== undefined) patch.category_id = data.categoryId;

    const { data: row, error } = await supabaseAdmin
      .from("products")
      .update(patch)
      .eq("id", data.id)
      .eq("seller_id", sellerId)
      .select(PRODUCT_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to update product: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }

  async setPublicationStatus(
    sellerId: string,
    id: string,
    status: ProductPublicationStatus,
  ): Promise<SellerProductDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .update({
        publication_status: status,
        is_active: isActiveForCatalog(status),
      })
      .eq("id", id)
      .eq("seller_id", sellerId)
      .select(PRODUCT_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to update publication status: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }
}

import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { InsufficientStockError } from "@server/domain/checkout.errors";

const INSUFFICIENT_STOCK_PREFIX = "INSUFFICIENT_STOCK:";

function toRpcItems(items: StockReservationItem[]) {
  return items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
}

function mapProduct(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  image_url: string | null;
  stock: number;
  category_id: string | null;
}): ProductDTO {
  const stock = Number(row.stock);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    unit: row.unit,
    imageUrl: row.image_url,
    stock,
    inStock: stock > 0,
    categoryId: row.category_id,
  };
}

const PRODUCT_SELECT =
  "id, name, slug, description, price, currency, unit, image_url, stock, category_id";

/** Supabase catalog repository — buyers see PUBLISHED products only. */
export class SupabaseProductRepository implements IProductRepository {
  async list(params: ProductListParams): Promise<ProductListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("publication_status", ProductPublicationStatus.PUBLISHED);

    if (params.inStockOnly) {
      query = query.gt("stock", 0);
    }
    if (params.search?.trim()) {
      query = query.ilike("name", `%${params.search.trim()}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Failed to list products: ${error.message}`);

    const items = (data ?? []).map(mapProduct);
    const total = count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total,
    };
  }

  async getBySlug(slug: string): Promise<ProductDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch product by slug: ${error.message}`);
    return data ? mapProduct(data) : null;
  }

  async getById(id: string): Promise<ProductDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", id)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch product: ${error.message}`);
    return data ? mapProduct(data) : null;
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getById(productId);
    if (!product) return false;
    return product.stock >= quantity;
  }

  async reserveStock(items: StockReservationItem[]): Promise<void> {
    if (items.length === 0) return;

    const { error } = await supabaseAdmin.rpc("reserve_product_stock", {
      items: toRpcItems(items),
    });

    if (error) {
      if (error.message.includes(INSUFFICIENT_STOCK_PREFIX)) {
        const productId = error.message.split(INSUFFICIENT_STOCK_PREFIX)[1]?.trim();
        throw new InsufficientStockError(productId || items[0].productId);
      }
      throw new Error(`Failed to reserve stock: ${error.message}`);
    }
  }

  async releaseStock(items: StockReservationItem[]): Promise<void> {
    if (items.length === 0) return;

    const { error } = await supabaseAdmin.rpc("release_product_stock", {
      items: toRpcItems(items),
    });

    if (error) throw new Error(`Failed to release stock: ${error.message}`);
  }
}

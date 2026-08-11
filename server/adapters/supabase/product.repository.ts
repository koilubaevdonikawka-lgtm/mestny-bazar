import type { ProductDTO, ProductListParams, ProductListResult } from "@shared/contracts/catalog";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";
import { OrderStatus } from "@shared/contracts/order";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { InsufficientStockError } from "@server/domain/checkout.errors";
import { toDbOrderStatus } from "@server/adapters/supabase/order.mapper";

const INSUFFICIENT_STOCK_PREFIX = "INSUFFICIENT_STOCK:";

/**
 * Caps how many filtered candidates are pulled in for an in-memory
 * popularity sort — the category page fetches a single, unpaginated batch
 * today (Stage 1/2), so this is generous enough to cover any real category
 * while keeping the aggregate query bounded. Revisit once real pagination
 * exists.
 */
const POPULARITY_CANDIDATE_CAP = 500;

function toRpcItems(items: StockReservationItem[]) {
  return items.map((item) => ({ productId: item.productId, quantity: item.quantity }));
}

/** Columns searched by ilike, combined with OR — matches products by name,
 * description, or manufacturer. SKU is deliberately excluded: no PUBLISHED
 * product currently has one set (verified against the live database), so
 * wiring it in would search a column that's always empty in practice —
 * revisit once sellers/admins actually populate it. */
const SEARCH_COLUMNS = ["name", "description", "manufacturer"] as const;

/** Escapes a value for embedding in a PostgREST `.or()` filter expression —
 * commas/periods/parens in the raw string would otherwise be parsed as
 * filter-grammar syntax rather than literal search text. Per PostgREST's
 * own escaping rule, wrapping the value in double quotes neutralizes those
 * characters; backslashes and embedded quotes must then be escaped. */
function escapeOrFilterValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function buildSearchFilter(term: string): string {
  const escaped = escapeOrFilterValue(`%${term}%`);
  return SEARCH_COLUMNS.map((column) => `${column}.ilike.${escaped}`).join(",");
}

interface CategoryEmbed {
  id: string;
  name: string;
  slug: string;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  stock: number;
  category_id: string | null;
  manufacturer: string | null;
  country_of_origin: string | null;
  /** Only present when fetched via PRODUCT_SELECT_WITH_CATEGORY (single-product reads). */
  categories?: CategoryEmbed | CategoryEmbed[] | null;
}

function mapProduct(row: ProductRow): ProductDTO {
  const stock = Number(row.stock);
  const categoryEmbed = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    unit: row.unit,
    imageUrl: row.image_url,
    imageUrls: row.image_urls ?? [],
    stock,
    inStock: stock > 0,
    categoryId: row.category_id,
    manufacturer: row.manufacturer,
    countryOfOrigin: row.country_of_origin,
    ...(categoryEmbed
      ? { category: { id: categoryEmbed.id, name: categoryEmbed.name, slug: categoryEmbed.slug } }
      : {}),
  };
}

const PRODUCT_SELECT =
  "id, name, slug, description, price, currency, unit, image_url, image_urls, stock, category_id, manufacturer, country_of_origin";

/** Adds the category name/slug — used only by single-product reads (the
 * product detail page needs to display the category), never by the listing
 * path, to avoid a join on the hot flat/category feed. */
const PRODUCT_SELECT_WITH_CATEGORY = `${PRODUCT_SELECT}, categories(id, name, slug)`;

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

    if (params.categoryId) {
      query = query.eq("category_id", params.categoryId);
    }
    if (params.excludeProductId) {
      query = query.neq("id", params.excludeProductId);
    }
    if (params.inStockOnly) {
      query = query.gt("stock", 0);
    }
    if (params.search?.trim()) {
      query = query.or(buildSearchFilter(params.search.trim()));
    }
    if (params.minPrice !== undefined) {
      query = query.gte("price", params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      query = query.lte("price", params.maxPrice);
    }
    if (params.manufacturers?.length) {
      query = query.in("manufacturer", params.manufacturers);
    }
    if (params.countriesOfOrigin?.length) {
      query = query.in("country_of_origin", params.countriesOfOrigin);
    }

    // `popularity` has no dedicated column — it's computed from real sales
    // data (order_items, excluding cancelled orders), never a fabricated
    // value. Supabase's query builder can't ORDER BY an aggregate across a
    // join in one call, so this path fetches the already-filtered
    // candidates, aggregates their sold quantity separately, sorts in
    // memory, then paginates — bounded by POPULARITY_CANDIDATE_CAP.
    if (params.sortBy === "popularity") {
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .limit(POPULARITY_CANDIDATE_CAP);

      if (error) throw new Error(`Failed to list products: ${error.message}`);

      const rows = (data ?? []) as ProductRow[];
      const popularity = await this.getPopularityCounts(rows.map((row) => row.id));
      const sorted = [...rows].sort(
        (a, b) => (popularity.get(b.id) ?? 0) - (popularity.get(a.id) ?? 0),
      );

      const items = sorted.slice(from, to + 1).map(mapProduct);
      const total = count ?? rows.length;
      return { items, total, page, pageSize, hasMore: from + items.length < total };
    }

    switch (params.sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "name":
        query = query.order("name", { ascending: true });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw new Error(`Failed to list products: ${error.message}`);

    const items = ((data ?? []) as ProductRow[]).map(mapProduct);
    const total = count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total,
    };
  }

  private async getPopularityCounts(productIds: string[]): Promise<Map<string, number>> {
    if (productIds.length === 0) return new Map();

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select("product_id, quantity, orders(status)")
      .in("product_id", productIds);

    if (error) throw new Error(`Failed to compute product popularity: ${error.message}`);

    const cancelledDbStatus = toDbOrderStatus(OrderStatus.CANCELLED);
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      if (!row.product_id) continue;
      const order = row.orders as { status: string } | { status: string }[] | null;
      const status = Array.isArray(order) ? order[0]?.status : order?.status;
      if (status === cancelledDbStatus) continue;
      counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + row.quantity);
    }
    return counts;
  }

  async getBySlug(slug: string): Promise<ProductDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT_WITH_CATEGORY)
      .eq("slug", slug)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch product by slug: ${error.message}`);
    return data ? mapProduct(data) : null;
  }

  async getById(id: string): Promise<ProductDTO | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT_WITH_CATEGORY)
      .eq("id", id)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch product: ${error.message}`);
    return data ? mapProduct(data) : null;
  }

  async getManyByIds(ids: string[]): Promise<ProductDTO[]> {
    if (ids.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED);

    if (error) throw new Error(`Failed to fetch products by id: ${error.message}`);
    return (data ?? []).map(mapProduct);
  }

  async getManyBySlugs(slugs: string[]): Promise<ProductDTO[]> {
    if (slugs.length === 0) return [];

    const { data, error } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT)
      .in("slug", slugs)
      .eq("publication_status", ProductPublicationStatus.PUBLISHED);

    if (error) throw new Error(`Failed to fetch products by slug: ${error.message}`);
    return (data ?? []).map(mapProduct);
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

  // Reuses release_product_stock (same additive, no-floor-check semantics a supply
  // receipt needs) — a dedicated RPC would run identical SQL under a different name.
  async increaseStock(items: StockReservationItem[]): Promise<void> {
    if (items.length === 0) return;

    const { error } = await supabaseAdmin.rpc("release_product_stock", {
      items: toRpcItems(items),
    });

    if (error) throw new Error(`Failed to increase stock: ${error.message}`);
  }
}

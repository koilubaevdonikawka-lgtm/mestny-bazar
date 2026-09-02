import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  SellerProductListParams,
  SellerProductListResult,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";
import { ProductPublicationStatus as Status } from "@shared/contracts/seller-product";
import type { ISellerProductRepository } from "@server/ports/seller-product.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

// Задача №231 — selects sort_order_text (a generated text mirror of the
// real numeric sort_order column), never the raw numeric column itself:
// PostgREST serializes a `text` column as a JSON string, which
// supabase-js's JSON.parse preserves verbatim, whereas a JSON *number*
// literal would be parsed into a lossy IEEE-754 double before this code
// ever runs — see the migration for the full explanation.
const PRODUCT_SELECT =
  "id, name, slug, description, price, currency, unit, image_url, image_urls, manufacturer, country_of_origin, sku, weight_kg, stock, publication_status, category_id, sort_order_text";

function mapRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  manufacturer: string | null;
  country_of_origin: string | null;
  sku: string | null;
  weight_kg: number | null;
  stock: number;
  publication_status: ProductPublicationStatus;
  category_id: string | null;
  sort_order_text: string | null;
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
    imageUrls: row.image_urls ?? [],
    manufacturer: row.manufacturer,
    countryOfOrigin: row.country_of_origin,
    sku: row.sku,
    weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
    stock: Number(row.stock),
    publicationStatus: row.publication_status,
    categoryId: row.category_id,
    sortOrder: row.sort_order_text,
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

  async listAll(params: SellerProductListParams): Promise<SellerProductListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Задача №236 — admin Каталог list now follows the same manual
    // sort_order as the storefront (Задача №231): ascending, NULLs last so
    // not-yet-numbered products (e.g. right after the Задача №233 reset)
    // still show up, at the end, instead of vanishing or floating to the
    // top. Ordered on the real numeric `sort_order` column, not the
    // `sort_order_text` mirror PRODUCT_SELECT reads for display — a
    // lexicographic ORDER BY on the text column would sort "10" before
    // "2". Tiebreak on created_at desc (newest first) for a stable order
    // among equal/absent sort_order values, mirroring product.repository.ts.
    const { data, error, count } = await supabaseAdmin
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(`Failed to list products: ${error.message}`);

    const items = (data ?? []).map(mapRow);
    const total = count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total,
    };
  }

  async getById(id: string, sellerId: string | null): Promise<SellerProductDTO | null> {
    let query = supabaseAdmin.from("products").select(PRODUCT_SELECT).eq("id", id);
    if (sellerId !== null) query = query.eq("seller_id", sellerId);

    const { data, error } = await query.maybeSingle();

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

  /**
   * Задача №230/231 — soft duplicate-sortOrder check: names the conflicting
   * product so the service can raise a clear, specific error. `sortOrder`
   * is a decimal string filtered against the real numeric column —
   * PostgREST/Postgres cast it for the equality comparison, so "1.10"
   * correctly matches an existing "1.1" (real decimal equality, not string
   * equality).
   */
  async findBySortOrder(
    sortOrder: string,
    exceptId?: string,
  ): Promise<{ id: string; name: string } | null> {
    let query = supabaseAdmin.from("products").select("id, name").eq("sort_order", sortOrder);
    if (exceptId) query = query.neq("id", exceptId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`Failed to check sort order: ${error.message}`);
    return data ?? null;
  }

  /**
   * Задача №231 — current-max+1 for auto-assigning a new product's
   * sort_order, computed entirely server-side via the next_product_sort_order
   * SQL function (real Postgres numeric MAX(), unbounded precision — never
   * a JS Math.max over possibly-imprecise parsed numbers). The function
   * itself returns text for the same JSON-number-vs-string reason as
   * sort_order_text.
   */
  async getNextSortOrder(): Promise<string> {
    const { data, error } = await supabaseAdmin.rpc("next_product_sort_order");
    if (error) throw new Error(`Failed to compute next sort order: ${error.message}`);
    return data;
  }

  async create(
    sellerId: string | null,
    data: CreateSellerProductRequest,
  ): Promise<SellerProductDTO> {
    const status = data.publicationStatus ?? Status.DRAFT;
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
        image_url: data.imageUrl ?? data.imageUrls?.[0] ?? null,
        image_urls: data.imageUrls ?? [],
        manufacturer: data.manufacturer ?? null,
        country_of_origin: data.countryOfOrigin ?? null,
        sku: data.sku ?? null,
        weight_kg: data.weightKg ?? null,
        stock: data.stock ?? 0,
        publication_status: status,
        is_active: isActiveForCatalog(status),
        category_id: data.categoryId ?? null,
        sort_order: data.sortOrder ?? null,
      })
      .select(PRODUCT_SELECT)
      .single();

    if (error || !row) {
      throw new Error(`Failed to create product: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }

  async update(
    sellerId: string | null,
    data: UpdateSellerProductRequest,
  ): Promise<SellerProductDTO> {
    const patch: TablesUpdate<"products"> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.slug !== undefined) patch.slug = data.slug;
    if (data.description !== undefined) patch.description = data.description;
    if (data.price !== undefined) patch.price = data.price;
    if (data.currency !== undefined) patch.currency = data.currency;
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.imageUrl !== undefined) patch.image_url = data.imageUrl;
    if (data.imageUrls !== undefined) {
      patch.image_urls = data.imageUrls;
      patch.image_url = data.imageUrls[0] ?? null;
    }
    if (data.manufacturer !== undefined) patch.manufacturer = data.manufacturer;
    if (data.countryOfOrigin !== undefined) patch.country_of_origin = data.countryOfOrigin;
    if (data.sku !== undefined) patch.sku = data.sku;
    if (data.weightKg !== undefined) patch.weight_kg = data.weightKg;
    if (data.stock !== undefined) patch.stock = data.stock;
    if (data.categoryId !== undefined) patch.category_id = data.categoryId;
    if (data.sortOrder !== undefined) patch.sort_order = data.sortOrder;
    if (data.publicationStatus !== undefined) {
      patch.publication_status = data.publicationStatus;
      patch.is_active = isActiveForCatalog(data.publicationStatus);
    }

    let query = supabaseAdmin.from("products").update(patch).eq("id", data.id);
    if (sellerId !== null) query = query.eq("seller_id", sellerId);

    const { data: row, error } = await query.select(PRODUCT_SELECT).single();

    if (error || !row) {
      throw new Error(`Failed to update product: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }

  async setPublicationStatus(
    sellerId: string | null,
    id: string,
    status: ProductPublicationStatus,
  ): Promise<SellerProductDTO> {
    let query = supabaseAdmin
      .from("products")
      .update({
        publication_status: status,
        is_active: isActiveForCatalog(status),
      })
      .eq("id", id);
    if (sellerId !== null) query = query.eq("seller_id", sellerId);

    const { data: row, error } = await query.select(PRODUCT_SELECT).single();

    if (error || !row) {
      throw new Error(`Failed to update publication status: ${error?.message ?? "unknown"}`);
    }
    return mapRow(row);
  }

  async delete(id: string, sellerId: string | null): Promise<void> {
    let query = supabaseAdmin.from("products").delete().eq("id", id);
    if (sellerId !== null) query = query.eq("seller_id", sellerId);

    const { error } = await query;
    if (error) throw new Error(`Failed to delete product: ${error.message}`);
  }
}

import type {
  IVariantStockRepository,
  VariantStockReservationItem,
  VariantStockRow,
} from "@server/ports/variant-stock.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { InsufficientVariantStockError } from "@server/domain/checkout.errors";

const INSUFFICIENT_VARIANT_STOCK_PREFIX = "INSUFFICIENT_VARIANT_STOCK:";

function toRpcItems(items: VariantStockReservationItem[]) {
  return items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
}

interface VariantStockDbRow {
  variant_id: string;
  stock: number;
  low_stock_threshold: number | null;
}

export function mapVariantStockRow(row: VariantStockDbRow): VariantStockRow {
  return {
    variantId: row.variant_id,
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
  };
}

const SELECT = "variant_id, stock, low_stock_threshold";

export class SupabaseVariantStockRepository implements IVariantStockRepository {
  async listForProduct(productId: string): Promise<VariantStockRow[]> {
    const { data, error } = await supabaseAdmin
      .from("product_variant_stock")
      .select(`${SELECT}, product_variants!inner(product_id)`)
      .eq("product_variants.product_id", productId);

    if (error) throw new Error(`Failed to list variant stock: ${error.message}`);
    return (data ?? []).map(mapVariantStockRow);
  }

  async getByVariantId(variantId: string): Promise<VariantStockRow | null> {
    const { data, error } = await supabaseAdmin
      .from("product_variant_stock")
      .select(SELECT)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch variant stock: ${error.message}`);
    return data ? mapVariantStockRow(data) : null;
  }

  async create(
    variantId: string,
    stock: number,
    lowStockThreshold: number | null,
  ): Promise<VariantStockRow> {
    const { data: row, error } = await supabaseAdmin
      .from("product_variant_stock")
      .insert({ variant_id: variantId, stock, low_stock_threshold: lowStockThreshold })
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to initialize variant stock: ${error?.message ?? "unknown"}`);
    return mapVariantStockRow(row);
  }

  async adjustStock(variantId: string, stock: number): Promise<VariantStockRow> {
    const { data: row, error } = await supabaseAdmin
      .from("product_variant_stock")
      .update({ stock })
      .eq("variant_id", variantId)
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to adjust variant stock: ${error?.message ?? "unknown"}`);
    return mapVariantStockRow(row);
  }

  async setLowStockThreshold(
    variantId: string,
    threshold: number | null,
  ): Promise<VariantStockRow> {
    const { data: row, error } = await supabaseAdmin
      .from("product_variant_stock")
      .update({ low_stock_threshold: threshold })
      .eq("variant_id", variantId)
      .select(SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to set variant stock threshold: ${error?.message ?? "unknown"}`);
    return mapVariantStockRow(row);
  }

  // Mirrors SupabaseProductRepository.reserveStock exactly (same guard,
  // same RPC-error-message parsing) — reserve_variant_stock additionally
  // skips a variantId with no tracked stock row (see the RPC's own comment).
  async reserveStock(items: VariantStockReservationItem[]): Promise<void> {
    if (items.length === 0) return;

    const { error } = await supabaseAdmin.rpc("reserve_variant_stock", {
      items: toRpcItems(items),
    });

    if (error) {
      if (error.message.includes(INSUFFICIENT_VARIANT_STOCK_PREFIX)) {
        const variantId = error.message.split(INSUFFICIENT_VARIANT_STOCK_PREFIX)[1]?.trim();
        throw new InsufficientVariantStockError(variantId || items[0].variantId);
      }
      throw new Error(`Failed to reserve variant stock: ${error.message}`);
    }
  }

  // Mirrors SupabaseProductRepository.releaseStock exactly.
  async releaseStock(items: VariantStockReservationItem[]): Promise<void> {
    if (items.length === 0) return;

    const { error } = await supabaseAdmin.rpc("release_variant_stock", {
      items: toRpcItems(items),
    });

    if (error) throw new Error(`Failed to release variant stock: ${error.message}`);
  }
}

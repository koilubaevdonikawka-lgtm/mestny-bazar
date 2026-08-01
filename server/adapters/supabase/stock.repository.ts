import type { StockRow } from "@server/ports/stock.repository";
import type { IStockRepository } from "@server/ports/stock.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface ProductStockRow {
  id: string;
  name: string;
  stock: number;
  low_stock_threshold: number | null;
  category_id: string | null;
}

export function mapStockRow(row: ProductStockRow): StockRow {
  return {
    productId: row.id,
    name: row.name,
    stock: Number(row.stock),
    lowStockThreshold: row.low_stock_threshold,
    categoryId: row.category_id,
  };
}

const STOCK_SELECT = "id, name, stock, low_stock_threshold, category_id";

/** Warehouse stock repository — all products regardless of publication status. */
export class SupabaseStockRepository implements IStockRepository {
  async list(): Promise<StockRow[]> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(STOCK_SELECT)
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to list stock: ${error.message}`);
    return (data ?? []).map(mapStockRow);
  }

  async getById(productId: string): Promise<StockRow | null> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(STOCK_SELECT)
      .eq("id", productId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch stock: ${error.message}`);
    return data ? mapStockRow(data) : null;
  }

  async adjustStock(productId: string, stock: number): Promise<StockRow> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ stock })
      .eq("id", productId)
      .select(STOCK_SELECT)
      .single();

    if (error || !data) throw new Error(`Failed to adjust stock: ${error?.message ?? "unknown"}`);
    return mapStockRow(data);
  }

  async setLowStockThreshold(productId: string, threshold: number | null): Promise<StockRow> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ low_stock_threshold: threshold })
      .eq("id", productId)
      .select(STOCK_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Failed to set low stock threshold: ${error?.message ?? "unknown"}`);
    }
    return mapStockRow(data);
  }
}

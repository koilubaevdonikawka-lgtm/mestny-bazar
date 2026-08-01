import type { ISupplyRepository } from "@server/ports/supply.repository";
import type {
  CreateSupplyRequest,
  SupplyDTO,
  SupplyItemDTO,
  SupplyStatus,
} from "@shared/contracts/supplier";
import { supabaseAdmin } from "@server/adapters/supabase/client";

interface SupplyRow {
  id: string;
  supplier_id: string;
  status: SupplyStatus;
  expected_at: string | null;
  created_at: string;
}

interface SupplyItemRow {
  id: string;
  product_id: string;
  quantity: number;
  purchase_price: number;
}

function mapSupplyItemRow(row: SupplyItemRow): SupplyItemDTO {
  return {
    id: row.id,
    productId: row.product_id,
    quantity: Number(row.quantity),
    purchasePrice: Number(row.purchase_price),
  };
}

function mapSupplyRow(row: SupplyRow, items: SupplyItemRow[]): SupplyDTO {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    status: row.status,
    expectedAt: row.expected_at,
    items: items.map(mapSupplyItemRow),
    createdAt: row.created_at,
  };
}

const SUPPLY_SELECT = "id, supplier_id, status, expected_at, created_at";
const SUPPLY_ITEM_SELECT = "id, product_id, quantity, purchase_price";

export class SupabaseSupplyRepository implements ISupplyRepository {
  async list(): Promise<SupplyDTO[]> {
    const { data: supplies, error } = await supabaseAdmin
      .from("supplies")
      .select(SUPPLY_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list supplies: ${error.message}`);
    return this.withItems(supplies ?? []);
  }

  async getById(id: string): Promise<SupplyDTO | null> {
    const { data: supply, error } = await supabaseAdmin
      .from("supplies")
      .select(SUPPLY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch supply: ${error.message}`);
    if (!supply) return null;

    const [mapped] = await this.withItems([supply]);
    return mapped;
  }

  async create(data: CreateSupplyRequest): Promise<SupplyDTO> {
    const { data: supply, error } = await supabaseAdmin
      .from("supplies")
      .insert({ supplier_id: data.supplierId, expected_at: data.expectedAt ?? null })
      .select(SUPPLY_SELECT)
      .single();

    if (error || !supply)
      throw new Error(`Failed to create supply: ${error?.message ?? "unknown"}`);

    const { error: itemsError } = await supabaseAdmin.from("supply_items").insert(
      data.items.map((item) => ({
        supply_id: supply.id,
        product_id: item.productId,
        quantity: item.quantity,
        purchase_price: item.purchasePrice,
      })),
    );

    if (itemsError) throw new Error(`Failed to create supply items: ${itemsError.message}`);

    const created = await this.getById(supply.id);
    if (!created) throw new Error(`Supply ${supply.id} not found immediately after creation`);
    return created;
  }

  async updateStatus(id: string, status: SupplyStatus): Promise<SupplyDTO> {
    const { error } = await supabaseAdmin.from("supplies").update({ status }).eq("id", id);
    if (error) throw new Error(`Failed to update supply status: ${error.message}`);

    const supply = await this.getById(id);
    if (!supply) throw new Error(`Supply ${id} not found after status update`);
    return supply;
  }

  private async withItems(supplies: SupplyRow[]): Promise<SupplyDTO[]> {
    if (!supplies.length) return [];

    const supplyIds = supplies.map((s) => s.id);
    const { data: allItems, error } = await supabaseAdmin
      .from("supply_items")
      .select(`${SUPPLY_ITEM_SELECT}, supply_id`)
      .in("supply_id", supplyIds);

    if (error) throw new Error(`Failed to list supply items: ${error.message}`);

    const itemsBySupply = new Map<string, SupplyItemRow[]>();
    for (const item of allItems ?? []) {
      const { supply_id, ...rest } = item;
      const list = itemsBySupply.get(supply_id) ?? [];
      list.push(rest);
      itemsBySupply.set(supply_id, list);
    }

    return supplies.map((supply) => mapSupplyRow(supply, itemsBySupply.get(supply.id) ?? []));
  }
}

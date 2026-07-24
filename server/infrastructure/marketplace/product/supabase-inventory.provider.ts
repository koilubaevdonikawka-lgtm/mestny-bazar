import type { IInventoryProvider } from "@server/application/modules/product/product/contracts";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess } from "@server/infrastructure/supabase/shared";

interface InventoryRecord {
  readonly productId: string;
  readonly quantity: number;
  readonly updatedAt: string;
}

/** Supabase-backed inventory provider using JSON snapshot persistence. */
export class SupabaseInventoryProvider implements IInventoryProvider {
  private readonly tableName = "marketplace_product_inventory_snapshots";

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async getAvailableStock(productId: string): Promise<number | null> {
    const record = await this.selectByProductId(productId);
    return record?.quantity ?? null;
  }

  async setStock(productId: string, quantity: number): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Stock quantity must be a non-negative integer.");
    }

    const row = {
      id: productId,
      snapshot: Object.freeze({
        productId,
        quantity,
        updatedAt: new Date().toISOString(),
      } satisfies InventoryRecord),
      updated_at: new Date().toISOString(),
    };

    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  private async selectByProductId(productId: string): Promise<InventoryRecord | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", productId).maybeSingle(),
    ) as { snapshot?: InventoryRecord } | null;

    return data?.snapshot ?? null;
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}

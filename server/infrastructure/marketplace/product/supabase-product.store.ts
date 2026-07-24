import type { IProductStore } from "@server/application/modules/product/product/contracts";
import type { Product } from "@server/application/modules/product/product/models";
import { ProductMapper } from "@server/infrastructure/marketplace/mappers";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import {
  assertSupabaseSuccess,
  SupabaseSnapshotTables,
  type SnapshotRow,
} from "@server/infrastructure/supabase/shared";

/** Supabase-backed product store using JSON snapshot persistence. */
export class SupabaseProductStore implements IProductStore {
  private readonly tableName = SupabaseSnapshotTables.products;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveProduct(product: Product): Promise<void> {
    const row = ProductMapper.toSnapshotRow(product);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async updateProduct(product: Product): Promise<void> {
    await this.saveProduct(product);
  }

  async findById(productId: string): Promise<Product | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at").eq("id", productId).maybeSingle(),
    );
    return ProductMapper.fromSnapshotRow(data as SnapshotRow<Product> | null);
  }

  async exists(productId: string): Promise<boolean> {
    return (await this.findById(productId)) !== null;
  }

  async deleteProduct(productId: string): Promise<void> {
    assertSupabaseSuccess(
      `${this.tableName}.delete`,
      await this.table().delete().eq("id", productId),
    );
  }

  async findBySellerId(sellerId: string): Promise<readonly Product[]> {
    const all = await this.findAllProducts();
    return all.filter((product) => product.sellerId === sellerId.trim());
  }

  async findAllProducts(): Promise<readonly Product[]> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, snapshot, updated_at"),
    );
    const rows = (data ?? []) as SnapshotRow<Product>[];
    return rows
      .map((row) => ProductMapper.fromSnapshotRow(row))
      .filter((product): product is Product => product !== null);
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}

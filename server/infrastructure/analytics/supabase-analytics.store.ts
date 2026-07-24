import type { IAnalyticsStore } from "@server/application/modules/analytics/analytics/contracts";
import type {
  CustomersProjection,
  MarketplaceProjection,
  OrdersProjection,
  ProductsProjection,
  SalesProjection,
  SellersProjection,
} from "@server/application/modules/analytics/analytics/projections";
import { AnalyticsProjectionMapper } from "@server/infrastructure/analytics/mappers/analytics-projection.mapper";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

type ProjectionId =
  | "sales"
  | "orders"
  | "customers"
  | "sellers"
  | "products"
  | "marketplace";

/** Supabase-backed analytics store using JSON snapshot persistence. */
export class SupabaseAnalyticsStore implements IAnalyticsStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  saveSalesProjection(projection: SalesProjection): Promise<void> {
    return this.saveProjection("sales", projection);
  }

  getSalesProjection(): Promise<SalesProjection | null> {
    return this.getProjection("sales");
  }

  saveOrdersProjection(projection: OrdersProjection): Promise<void> {
    return this.saveProjection("orders", projection);
  }

  getOrdersProjection(): Promise<OrdersProjection | null> {
    return this.getProjection("orders");
  }

  saveCustomersProjection(projection: CustomersProjection): Promise<void> {
    return this.saveProjection("customers", projection);
  }

  getCustomersProjection(): Promise<CustomersProjection | null> {
    return this.getProjection("customers");
  }

  saveSellersProjection(projection: SellersProjection): Promise<void> {
    return this.saveProjection("sellers", projection);
  }

  getSellersProjection(): Promise<SellersProjection | null> {
    return this.getProjection("sellers");
  }

  saveProductsProjection(projection: ProductsProjection): Promise<void> {
    return this.saveProjection("products", projection);
  }

  getProductsProjection(): Promise<ProductsProjection | null> {
    return this.getProjection("products");
  }

  saveMarketplaceProjection(projection: MarketplaceProjection): Promise<void> {
    return this.saveProjection("marketplace", projection);
  }

  getMarketplaceProjection(): Promise<MarketplaceProjection | null> {
    return this.getProjection("marketplace");
  }

  async clearAllProjections(): Promise<void> {
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.analyticsProjections}.delete`,
      await this.projectionTable().delete().neq("id", ""),
    );
  }

  private async saveProjection<T extends { id: string; updatedAt: string }>(
    projectionId: ProjectionId,
    projection: T,
  ): Promise<void> {
    const row = AnalyticsProjectionMapper.toSnapshotRow(projectionId, projection);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.analyticsProjections}.upsert`,
      await this.projectionTable().upsert(row, { onConflict: "id" }),
    );
  }

  private async getProjection<T>(projectionId: ProjectionId): Promise<T | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.analyticsProjections}.select`,
      await this.projectionTable()
        .select("id, projection_id, snapshot, updated_at")
        .eq("id", projectionId)
        .maybeSingle(),
    );
    return AnalyticsProjectionMapper.fromSnapshotRow<T>(
      data as SnapshotRow<T> & { projection_id?: string } | null,
    );
  }

  private projectionTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.analyticsProjections);
    }
    return client
      .schema(this.configuration.schema)
      .from(MarketplaceSnapshotTables.analyticsProjections);
  }
}

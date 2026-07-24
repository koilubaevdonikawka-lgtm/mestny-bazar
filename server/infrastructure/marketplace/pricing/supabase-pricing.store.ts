import type { IPricingStore } from "@server/application/modules/pricing/pricing/contracts";
import type {
  Discount,
  Price,
  PriceRule,
  Promotion,
} from "@server/application/modules/pricing/pricing/models";
import {
  DiscountMapper,
  PriceMapper,
  PriceRuleMapper,
  PromotionMapper,
} from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed pricing store using JSON snapshot persistence. */
export class SupabasePricingStore implements IPricingStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async savePrice(price: Price): Promise<void> {
    const row = PriceMapper.toSnapshotRow(price);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.prices}.upsert`,
      await this.priceTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updatePrice(price: Price): Promise<void> {
    await this.savePrice(price);
  }

  async findCurrentPriceByProductId(productId: string): Promise<Price | null> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.prices}.selectByProduct`,
      await this.priceTable()
        .select("id, product_id, snapshot, updated_at")
        .eq("product_id", productId)
        .order("updated_at", { ascending: false })
        .limit(1),
    ) as Array<SnapshotRow<Price> & { product_id: string }>;

    return PriceMapper.fromSnapshotRow(rows[0] ?? null);
  }

  async savePriceRule(rule: PriceRule): Promise<void> {
    const row = PriceRuleMapper.toSnapshotRow(rule);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.priceRules}.upsert`,
      await this.priceRuleTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findActivePriceRulesByProductId(productId: string): Promise<readonly PriceRule[]> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.priceRules}.selectByProduct`,
      await this.priceRuleTable()
        .select("id, product_id, snapshot, updated_at")
        .eq("product_id", productId),
    ) as Array<SnapshotRow<PriceRule> & { product_id: string }>;

    return Object.freeze(
      rows
        .map((row) => PriceRuleMapper.fromSnapshotRow(row))
        .filter((rule): rule is PriceRule => rule !== null && rule.active),
    );
  }

  async saveDiscount(discount: Discount): Promise<void> {
    const row = DiscountMapper.toSnapshotRow(discount);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.discounts}.upsert`,
      await this.discountTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findDiscountById(discountId: string): Promise<Discount | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.discounts}.select`,
      await this.discountTable().select("id, snapshot, updated_at").eq("id", discountId).maybeSingle(),
    );
    return DiscountMapper.fromSnapshotRow(data as SnapshotRow<Discount> | null);
  }

  async savePromotion(promotion: Promotion): Promise<void> {
    const row = PromotionMapper.toSnapshotRow(promotion);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.promotions}.upsert`,
      await this.promotionTable().upsert(row, { onConflict: "id" }),
    );
  }

  async findPromotionById(promotionId: string): Promise<Promotion | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.promotions}.select`,
      await this.promotionTable().select("id, snapshot, updated_at").eq("id", promotionId).maybeSingle(),
    );
    return PromotionMapper.fromSnapshotRow(data as SnapshotRow<Promotion> | null);
  }

  private priceTable() {
    return this.table(MarketplaceSnapshotTables.prices);
  }

  private priceRuleTable() {
    return this.table(MarketplaceSnapshotTables.priceRules);
  }

  private discountTable() {
    return this.table(MarketplaceSnapshotTables.discounts);
  }

  private promotionTable() {
    return this.table(MarketplaceSnapshotTables.promotions);
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}

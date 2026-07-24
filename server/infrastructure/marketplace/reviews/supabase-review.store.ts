import type { IReviewStore } from "@server/application/modules/reviews/reviews/contracts";
import type { Review } from "@server/application/modules/reviews/reviews/models";
import { ReviewMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed review store using JSON snapshot persistence. */
export class SupabaseReviewStore implements IReviewStore {
  private readonly tableName = MarketplaceSnapshotTables.reviews;

  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async createReview(review: Review): Promise<void> {
    const row = ReviewMapper.toSnapshotRow(review);
    assertSupabaseSuccess(
      `${this.tableName}.upsert`,
      await this.table().upsert(row, { onConflict: "id" }),
    );
  }

  async updateReview(review: Review): Promise<void> {
    await this.createReview(review);
  }

  async deleteReview(reviewId: string): Promise<void> {
    assertSupabaseSuccess(
      `${this.tableName}.delete`,
      await this.table().delete().eq("id", reviewId),
    );
  }

  async listByProduct(productId: string): Promise<readonly Review[]> {
    const rows = assertSupabaseSuccess(
      `${this.tableName}.selectByProduct`,
      await this.table()
        .select("id, product_id, snapshot, updated_at")
        .eq("product_id", productId),
    ) as Array<SnapshotRow<Review> & { product_id: string }>;

    return Object.freeze(
      rows
        .map((row) => ReviewMapper.fromSnapshotRow(row))
        .filter((review): review is Review => review !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async getReview(reviewId: string): Promise<Review | null> {
    const data = assertSupabaseSuccess(
      `${this.tableName}.select`,
      await this.table().select("id, product_id, snapshot, updated_at").eq("id", reviewId).maybeSingle(),
    );
    return ReviewMapper.fromSnapshotRow(data as (SnapshotRow<Review> & { product_id?: string }) | null);
  }

  private table() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(this.tableName);
    }
    return client.schema(this.configuration.schema).from(this.tableName);
  }
}

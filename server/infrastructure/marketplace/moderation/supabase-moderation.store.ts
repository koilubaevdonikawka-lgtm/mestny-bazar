import type { IModerationStore } from "@server/application/modules/moderation/moderation/contracts";
import type { ModerationRequest } from "@server/application/modules/moderation/moderation/models";
import type { ModerationTargetValue } from "@server/application/modules/moderation/moderation/models/moderation-target.model";
import { ModerationRequestMapper } from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed moderation store using JSON snapshot persistence. */
export class SupabaseModerationStore implements IModerationStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveRequest(request: ModerationRequest): Promise<void> {
    const row = ModerationRequestMapper.toSnapshotRow(request);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.moderationRequests}.upsert`,
      await this.requestTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateRequest(request: ModerationRequest): Promise<void> {
    await this.saveRequest(request);
  }

  async findRequestById(requestId: string): Promise<ModerationRequest | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.moderationRequests}.select`,
      await this.requestTable()
        .select("id, target, target_id, snapshot, updated_at")
        .eq("id", requestId.trim())
        .maybeSingle(),
    );
    return ModerationRequestMapper.fromSnapshotRow(
      data as SnapshotRow<ModerationRequest> & { target?: string; target_id?: string } | null,
    );
  }

  async findLatestRequestByTarget(
    target: ModerationTargetValue,
    targetId: string,
  ): Promise<ModerationRequest | null> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.moderationRequests}.selectByTarget`,
      await this.requestTable()
        .select("id, target, target_id, snapshot, updated_at")
        .eq("target", target)
        .eq("target_id", targetId.trim())
        .order("updated_at", { ascending: false })
        .limit(1),
    ) as Array<SnapshotRow<ModerationRequest> & { target?: string; target_id?: string }>;

    return ModerationRequestMapper.fromSnapshotRow(rows[0] ?? null);
  }

  private requestTable() {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(MarketplaceSnapshotTables.moderationRequests);
    }
    return client.schema(this.configuration.schema).from(MarketplaceSnapshotTables.moderationRequests);
  }
}

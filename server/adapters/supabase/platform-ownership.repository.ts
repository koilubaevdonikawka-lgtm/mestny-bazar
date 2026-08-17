import type {
  CreateOwnershipTransferInput,
  IPlatformOwnershipRepository,
  OwnershipTransferRecord,
  OwnershipTransferStatus,
  PlatformOwnershipRecord,
  PlatformOwnershipRole,
} from "@server/ports/platform-ownership.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { OwnershipTransferInvalidStateError } from "@server/domain/ownership-transfer.errors";

const TRANSFER_NOT_ACCEPTED_MARKER = "TRANSFER_NOT_ACCEPTED";

interface PlatformOwnershipRow {
  user_id: string;
  role: PlatformOwnershipRole;
  created_at: string;
  updated_at: string;
}

interface OwnershipTransferRow {
  id: string;
  initiator_user_id: string;
  target_user_id: string;
  status: OwnershipTransferStatus;
  full_handover: boolean;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

function mapOwnershipRow(row: PlatformOwnershipRow): PlatformOwnershipRecord {
  return {
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTransferRow(row: OwnershipTransferRow): OwnershipTransferRecord {
  return {
    id: row.id,
    initiatorUserId: row.initiator_user_id,
    targetUserId: row.target_user_id,
    status: row.status,
    fullHandover: row.full_handover,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
  };
}

/** Stage 1 — pure storage access for Platform Ownership. No claim/Transfer business logic here (see BOOTSTRAP_STAGE1_SPECIFICATION.md §4). */
export class SupabasePlatformOwnershipRepository implements IPlatformOwnershipRepository {
  async getByUserId(userId: string): Promise<PlatformOwnershipRecord | null> {
    const { data, error } = await supabaseAdmin
      .from("platform_ownership")
      .select("user_id, role, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch platform ownership record: ${error.message}`);
    return data ? mapOwnershipRow(data) : null;
  }

  async create(userId: string, role: PlatformOwnershipRole): Promise<void> {
    const { error } = await supabaseAdmin
      .from("platform_ownership")
      .insert({ user_id: userId, role });

    if (error) throw new Error(`Failed to create platform ownership record: ${error.message}`);
  }

  async countByRole(role: PlatformOwnershipRole): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("platform_ownership")
      .select("user_id", { count: "exact", head: true })
      .eq("role", role);

    if (error) throw new Error(`Failed to count platform ownership records: ${error.message}`);
    return count ?? 0;
  }

  async createTransfer(input: CreateOwnershipTransferInput): Promise<OwnershipTransferRecord> {
    const { data, error } = await supabaseAdmin
      .from("ownership_transfers")
      .insert({
        initiator_user_id: input.initiatorUserId,
        target_user_id: input.targetUserId,
        full_handover: input.fullHandover,
      })
      .select(
        "id, initiator_user_id, target_user_id, status, full_handover, created_at, accepted_at, completed_at, cancelled_at",
      )
      .single();

    if (error) throw new Error(`Failed to create ownership transfer: ${error.message}`);
    return mapTransferRow(data);
  }

  async getTransferById(id: string): Promise<OwnershipTransferRecord | null> {
    const { data, error } = await supabaseAdmin
      .from("ownership_transfers")
      .select(
        "id, initiator_user_id, target_user_id, status, full_handover, created_at, accepted_at, completed_at, cancelled_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch ownership transfer: ${error.message}`);
    return data ? mapTransferRow(data) : null;
  }

  async listPendingTransfersForTarget(targetUserId: string): Promise<OwnershipTransferRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("ownership_transfers")
      .select(
        "id, initiator_user_id, target_user_id, status, full_handover, created_at, accepted_at, completed_at, cancelled_at",
      )
      .eq("target_user_id", targetUserId)
      .eq("status", "PENDING");

    if (error) throw new Error(`Failed to list pending ownership transfers: ${error.message}`);
    return (data ?? []).map(mapTransferRow);
  }

  async acceptTransfer(id: string): Promise<OwnershipTransferRecord> {
    const { data, error } = await supabaseAdmin
      .from("ownership_transfers")
      .update({ status: "ACCEPTED", accepted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "PENDING")
      .select(
        "id, initiator_user_id, target_user_id, status, full_handover, created_at, accepted_at, completed_at, cancelled_at",
      )
      .maybeSingle();

    if (error) throw new Error(`Failed to accept ownership transfer: ${error.message}`);
    if (!data) throw new OwnershipTransferInvalidStateError("Transfer is not PENDING");
    return mapTransferRow(data);
  }

  async cancelTransfer(id: string): Promise<OwnershipTransferRecord> {
    const { data, error } = await supabaseAdmin
      .from("ownership_transfers")
      .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "PENDING")
      .select(
        "id, initiator_user_id, target_user_id, status, full_handover, created_at, accepted_at, completed_at, cancelled_at",
      )
      .maybeSingle();

    if (error) throw new Error(`Failed to cancel ownership transfer: ${error.message}`);
    if (!data) throw new OwnershipTransferInvalidStateError("Transfer is not PENDING");
    return mapTransferRow(data);
  }

  async completeTransfer(id: string): Promise<OwnershipTransferRecord> {
    const { error } = await supabaseAdmin.rpc("complete_ownership_transfer", {
      p_transfer_id: id,
    });

    if (error) {
      if (error.message.includes(TRANSFER_NOT_ACCEPTED_MARKER)) {
        throw new OwnershipTransferInvalidStateError("Transfer is not ACCEPTED");
      }
      throw new Error(`Failed to complete ownership transfer: ${error.message}`);
    }

    const completed = await this.getTransferById(id);
    if (!completed) throw new Error("Ownership transfer disappeared after completion");
    return completed;
  }
}

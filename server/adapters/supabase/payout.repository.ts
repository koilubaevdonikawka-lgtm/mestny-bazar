import type {
  CreatePayoutRunRequest,
  PayoutStatus,
  SellerPayoutDTO,
} from "@shared/contracts/payout";
import { OrderStatus } from "@shared/contracts/order";
import type { IPayoutRepository } from "@server/ports/payout.repository";
import { supabaseAdmin } from "@server/adapters/supabase/client";
import { toDbOrderStatus } from "@server/adapters/supabase/order.mapper";

interface PayoutRow {
  id: string;
  seller_id: string;
  period_start: string;
  period_end: string;
  gross_revenue: number;
  commission_rate: number;
  commission_amount: number;
  payout_amount: number;
  status: PayoutStatus;
  created_at: string;
  completed_at: string | null;
}

export function mapPayoutRow(row: PayoutRow): SellerPayoutDTO {
  return {
    id: row.id,
    sellerId: row.seller_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    grossRevenue: Number(row.gross_revenue),
    commissionRate: Number(row.commission_rate),
    commissionAmount: Number(row.commission_amount),
    payoutAmount: Number(row.payout_amount),
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

const PAYOUT_SELECT =
  "id, seller_id, period_start, period_end, gross_revenue, commission_rate, commission_amount, payout_amount, status, created_at, completed_at";

interface OrderItemRevenueRow {
  line_total: number;
  orders: { status: string; created_at: string } | { status: string; created_at: string }[] | null;
}

export class SupabasePayoutRepository implements IPayoutRepository {
  async listAll(): Promise<SellerPayoutDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("seller_payouts")
      .select(PAYOUT_SELECT)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list payouts: ${error.message}`);
    return (data ?? []).map(mapPayoutRow);
  }

  async listBySeller(sellerId: string): Promise<SellerPayoutDTO[]> {
    const { data, error } = await supabaseAdmin
      .from("seller_payouts")
      .select(PAYOUT_SELECT)
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to list seller payouts: ${error.message}`);
    return (data ?? []).map(mapPayoutRow);
  }

  async create(
    data: CreatePayoutRunRequest & {
      grossRevenue: number;
      commissionRate: number;
      commissionAmount: number;
      payoutAmount: number;
    },
  ): Promise<SellerPayoutDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("seller_payouts")
      .insert({
        seller_id: data.sellerId,
        period_start: data.periodStart,
        period_end: data.periodEnd,
        gross_revenue: data.grossRevenue,
        commission_rate: data.commissionRate,
        commission_amount: data.commissionAmount,
        payout_amount: data.payoutAmount,
      })
      .select(PAYOUT_SELECT)
      .single();

    if (error || !row) throw new Error(`Failed to create payout: ${error?.message ?? "unknown"}`);
    return mapPayoutRow(row);
  }

  async setStatus(id: string, status: PayoutStatus): Promise<SellerPayoutDTO> {
    const { data: row, error } = await supabaseAdmin
      .from("seller_payouts")
      .update({
        status,
        completed_at: status === "COMPLETED" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select(PAYOUT_SELECT)
      .single();

    if (error || !row)
      throw new Error(`Failed to update payout status: ${error?.message ?? "unknown"}`);
    return mapPayoutRow(row);
  }

  async sumSellerRevenue(
    sellerId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<number> {
    // Two-step: Finance doesn't own products/orders (Catalog/Orders do), but is a
    // sanctioned direct reader of both per finance.md's "Принцип владения данными" —
    // resolving product ids first avoids a cross-table filter on a nested join.
    const { data: productRows, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("seller_id", sellerId);

    if (productError) throw new Error(`Failed to resolve seller products: ${productError.message}`);
    const productIds = (productRows ?? []).map((p) => p.id);
    if (productIds.length === 0) return 0;

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select("line_total, orders!inner(status, created_at)")
      .in("product_id", productIds)
      .eq("orders.status", toDbOrderStatus(OrderStatus.DELIVERED))
      .gte("orders.created_at", periodStart)
      .lte("orders.created_at", periodEnd);

    if (error) throw new Error(`Failed to sum seller revenue: ${error.message}`);
    return ((data ?? []) as OrderItemRevenueRow[]).reduce(
      (sum, row) => sum + Number(row.line_total),
      0,
    );
  }
}

export const PayoutStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
} as const;

export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

export interface SellerPayoutDTO {
  id: string;
  sellerId: string;
  periodStart: string;
  periodEnd: string;
  grossRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  payoutAmount: number;
  status: PayoutStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface CreatePayoutRunRequest {
  sellerId: string;
  periodStart: string;
  periodEnd: string;
}

/** finance.md — read-only overview aggregates, not persisted (recomputed per request). */
export interface FinanceOverviewDTO {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayoutCount: number;
}

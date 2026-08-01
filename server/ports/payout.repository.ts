import type {
  CreatePayoutRunRequest,
  PayoutStatus,
  SellerPayoutDTO,
} from "@shared/contracts/payout";

export interface IPayoutRepository {
  listAll(): Promise<SellerPayoutDTO[]>;
  listBySeller(sellerId: string): Promise<SellerPayoutDTO[]>;
  create(
    data: CreatePayoutRunRequest & {
      grossRevenue: number;
      commissionRate: number;
      commissionAmount: number;
      payoutAmount: number;
    },
  ): Promise<SellerPayoutDTO>;
  setStatus(id: string, status: PayoutStatus): Promise<SellerPayoutDTO>;
  /**
   * finance.md — the payout run's revenue basis: sum of order_items.line_total
   * for this seller's products, across DELIVERED orders in the period. Finance
   * doesn't own products/orders (Catalog/Orders do); this is a pure read
   * across tables Finance is a sanctioned consumer of, not a new mechanism.
   */
  sumSellerRevenue(sellerId: string, periodStart: string, periodEnd: string): Promise<number>;
}

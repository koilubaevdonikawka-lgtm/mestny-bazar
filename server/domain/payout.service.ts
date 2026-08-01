import type { IPayoutRepository } from "@server/ports/payout.repository";
import type { ICommissionPolicy } from "@server/ports/commission-policy.port";
import type { SettingsService } from "@server/domain/settings.service";
import type {
  CreatePayoutRunRequest,
  FinanceOverviewDTO,
  PayoutStatus,
  SellerPayoutDTO,
} from "@shared/contracts/payout";

const COMMISSION_RATE_SETTING_KEY = "finance.commission_rate";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * finance.md — never writes to orders (that's CheckoutService/OrderService's
 * job); reads already-settled order state via IPayoutRepository.sumSellerRevenue
 * and produces its own new aggregate (a payout run). Reconciliation with the
 * Finik provider is explicitly blocked (finik.adapter.ts is a stub) and out
 * of scope here.
 */
export class PayoutService {
  constructor(
    private readonly payouts: IPayoutRepository,
    private readonly commissionPolicy: ICommissionPolicy,
    private readonly settings: SettingsService,
  ) {}

  async createPayoutRun(request: CreatePayoutRunRequest): Promise<SellerPayoutDTO> {
    const grossRevenue = await this.payouts.sumSellerRevenue(
      request.sellerId,
      request.periodStart,
      request.periodEnd,
    );

    // Settings reads are async but Rule Engines stay synchronous (Принцип 12) —
    // pre-fetch here, same pattern CheckoutService uses for isBlocked.
    const setting = await this.settings.get(COMMISSION_RATE_SETTING_KEY);
    const settingsRate = typeof setting?.value === "number" ? setting.value : null;
    const { rate } = this.commissionPolicy.resolveRate({
      sellerId: request.sellerId,
      settingsRate,
    });

    const commissionAmount = round2(grossRevenue * rate);
    const payoutAmount = round2(grossRevenue - commissionAmount);

    return this.payouts.create({
      sellerId: request.sellerId,
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
      grossRevenue,
      commissionRate: rate,
      commissionAmount,
      payoutAmount,
    });
  }

  async completePayout(id: string): Promise<SellerPayoutDTO> {
    return this.payouts.setStatus(id, "COMPLETED" satisfies PayoutStatus);
  }

  async listAll(): Promise<SellerPayoutDTO[]> {
    return this.payouts.listAll();
  }

  async listBySeller(sellerId: string): Promise<SellerPayoutDTO[]> {
    return this.payouts.listBySeller(sellerId);
  }

  async getOverview(): Promise<FinanceOverviewDTO> {
    const all = await this.payouts.listAll();
    return {
      totalRevenue: all.reduce((sum, p) => sum + p.grossRevenue, 0),
      totalCommission: all.reduce((sum, p) => sum + p.commissionAmount, 0),
      totalPayouts: all.reduce((sum, p) => sum + p.payoutAmount, 0),
      pendingPayoutCount: all.filter((p) => p.status === "PENDING").length,
    };
  }
}

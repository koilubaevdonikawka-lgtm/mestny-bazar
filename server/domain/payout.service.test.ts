import { describe, expect, it, vi } from "vitest";
import { PayoutService } from "@server/domain/payout.service";
import { SettingsService } from "@server/domain/settings.service";
import { CommissionPolicyService } from "@server/domain/commission-policy/commission-policy.service";
import { FlatCommissionRule } from "@server/domain/commission-policy/rules/flat-commission.rule";
import type { IPayoutRepository } from "@server/ports/payout.repository";
import type { ISettingsRepository } from "@server/ports/settings.repository";
import type { PlatformSettingDTO } from "@shared/contracts/settings";
import type { SellerPayoutDTO } from "@shared/contracts/payout";

function makePayout(overrides: Partial<SellerPayoutDTO> = {}): SellerPayoutDTO {
  return {
    id: "payout-1",
    sellerId: "seller-1",
    periodStart: "2026-01-01T00:00:00.000Z",
    periodEnd: "2026-01-31T00:00:00.000Z",
    grossRevenue: 1000,
    commissionRate: 0.1,
    commissionAmount: 100,
    payoutAmount: 900,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

function fakePayoutRepository(overrides: Partial<IPayoutRepository> = {}): IPayoutRepository {
  return {
    listAll: vi.fn(async () => []),
    listBySeller: vi.fn(async () => []),
    create: vi.fn(async () => makePayout()),
    setStatus: vi.fn(async () => makePayout({ status: "COMPLETED" })),
    sumSellerRevenue: vi.fn(async () => 1000),
    ...overrides,
  };
}

function fakeSettingsRepository(overrides: Partial<ISettingsRepository> = {}): ISettingsRepository {
  return {
    list: vi.fn(async () => []),
    get: vi.fn(async () => null),
    set: vi.fn(),
    ...overrides,
  } as ISettingsRepository;
}

describe("PayoutService.createPayoutRun", () => {
  it("computes commission and payout amounts from seller revenue and the platform default rate", async () => {
    const payouts = fakePayoutRepository({ sumSellerRevenue: vi.fn(async () => 1000) });
    const settings = new SettingsService(fakeSettingsRepository());
    const commissionPolicy = new CommissionPolicyService([new FlatCommissionRule()]);
    const service = new PayoutService(payouts, commissionPolicy, settings);

    await service.createPayoutRun({
      sellerId: "seller-1",
      periodStart: "2026-01-01T00:00:00.000Z",
      periodEnd: "2026-01-31T00:00:00.000Z",
    });

    expect(payouts.create).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: "seller-1",
        grossRevenue: 1000,
        commissionRate: 0.1,
        commissionAmount: 100,
        payoutAmount: 900,
      }),
    );
  });

  it("uses the admin-configured commission rate from Settings when one exists", async () => {
    const payouts = fakePayoutRepository({ sumSellerRevenue: vi.fn(async () => 1000) });
    const settingRow: PlatformSettingDTO = {
      key: "finance.commission_rate",
      value: 0.2,
      category: "finance",
      updatedBy: "admin-1",
      updatedAt: new Date().toISOString(),
    };
    const settings = new SettingsService(
      fakeSettingsRepository({ get: vi.fn(async () => settingRow) }),
    );
    const commissionPolicy = new CommissionPolicyService([new FlatCommissionRule()]);
    const service = new PayoutService(payouts, commissionPolicy, settings);

    await service.createPayoutRun({
      sellerId: "seller-1",
      periodStart: "2026-01-01T00:00:00.000Z",
      periodEnd: "2026-01-31T00:00:00.000Z",
    });

    expect(payouts.create).toHaveBeenCalledWith(
      expect.objectContaining({ commissionRate: 0.2, commissionAmount: 200, payoutAmount: 800 }),
    );
  });
});

describe("PayoutService.getOverview", () => {
  it("aggregates revenue, commission, payout totals and pending count across all payouts", async () => {
    const payouts = fakePayoutRepository({
      listAll: vi.fn(async () => [
        makePayout({
          grossRevenue: 1000,
          commissionAmount: 100,
          payoutAmount: 900,
          status: "PENDING",
        }),
        makePayout({
          grossRevenue: 500,
          commissionAmount: 50,
          payoutAmount: 450,
          status: "COMPLETED",
        }),
      ]),
    });
    const settings = new SettingsService(fakeSettingsRepository());
    const commissionPolicy = new CommissionPolicyService([new FlatCommissionRule()]);
    const service = new PayoutService(payouts, commissionPolicy, settings);

    const overview = await service.getOverview();

    expect(overview).toEqual({
      totalRevenue: 1500,
      totalCommission: 150,
      totalPayouts: 1350,
      pendingPayoutCount: 1,
    });
  });
});

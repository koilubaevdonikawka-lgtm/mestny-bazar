import type {
  CreatePayoutRunRequest,
  FinanceOverviewDTO,
  SellerPayoutDTO,
} from "@shared/contracts/payout";
import { requireAdminFromRequest, requireSellerFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "finance";

export async function executeGetFinanceOverview(): Promise<FinanceOverviewDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().payoutService.getOverview();
}

export async function executeListPayouts(): Promise<SellerPayoutDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().payoutService.listAll();
}

export async function executeCreatePayoutRun(
  request: CreatePayoutRunRequest,
): Promise<SellerPayoutDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().payoutService.createPayoutRun(request);
}

export async function executeCompletePayout(id: string): Promise<SellerPayoutDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().payoutService.completePayout(id);
}

/** finance.md — Seller sees only their own payouts (read-only), no Admin Platform module gate. */
export async function executeListMyPayouts(): Promise<SellerPayoutDTO[]> {
  const { userId } = await requireSellerFromRequest();
  return getServices().payoutService.listBySeller(userId);
}

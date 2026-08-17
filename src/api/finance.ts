import type {
  CreatePayoutRunRequest,
  FinanceOverviewDTO,
  SellerPayoutDTO,
} from "@shared/contracts/payout";
import {
  completePayoutFn,
  createPayoutRunFn,
  getFinanceOverviewFn,
  listMyPayoutsFn,
  listPayoutsFn,
} from "@/api/finance.functions";

export async function getFinanceOverview(): Promise<FinanceOverviewDTO> {
  return getFinanceOverviewFn();
}

export async function listPayouts(): Promise<SellerPayoutDTO[]> {
  return listPayoutsFn();
}

export async function listMyPayouts(): Promise<SellerPayoutDTO[]> {
  return listMyPayoutsFn();
}

export async function createPayoutRun(request: CreatePayoutRunRequest): Promise<SellerPayoutDTO> {
  return createPayoutRunFn({ data: request });
}

export async function completePayout(id: string): Promise<SellerPayoutDTO> {
  return completePayoutFn({ data: { id } });
}

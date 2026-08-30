import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  PublicDeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";
import {
  createDeliveryTariffFn,
  listDeliveryTariffsFn,
  listPublicDeliveryTariffsFn,
  updateDeliveryTariffFn,
} from "@/api/delivery-tariff.functions";

export async function listDeliveryTariffs(): Promise<DeliveryTariffDTO[]> {
  return listDeliveryTariffsFn();
}

export async function listPublicDeliveryTariffs(): Promise<PublicDeliveryTariffDTO[]> {
  return listPublicDeliveryTariffsFn();
}

export async function createDeliveryTariff(
  request: CreateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  return createDeliveryTariffFn({ data: request });
}

export async function updateDeliveryTariff(
  request: UpdateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  return updateDeliveryTariffFn({ data: request });
}

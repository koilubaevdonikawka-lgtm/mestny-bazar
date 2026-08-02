import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListDeliveryTariffs(): Promise<DeliveryTariffDTO[]> {
  await requireAdminFromRequest();
  return getServices().deliveryTariffAdminService.listTariffs();
}

export async function executeCreateDeliveryTariff(
  data: CreateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  await requireAdminFromRequest();
  return getServices().deliveryTariffAdminService.createTariff(data);
}

export async function executeUpdateDeliveryTariff(
  data: UpdateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  await requireAdminFromRequest();
  return getServices().deliveryTariffAdminService.updateTariff(data);
}

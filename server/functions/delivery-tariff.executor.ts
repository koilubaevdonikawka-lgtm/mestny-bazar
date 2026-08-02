import type {
  CreateDeliveryTariffRequest,
  DeliveryTariffDTO,
  UpdateDeliveryTariffRequest,
} from "@shared/contracts/delivery";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "delivery";

/**
 * Tariff management is also reachable by the admin-marketing scope
 * (docs/delivery/DELIVERY_MASTER_SPEC.md §5 — seasonal/promotional pricing
 * campaigns), same requireAdminFromRequest() + permissionPolicy.assert()
 * pattern already used by marketing.executor.ts for coupons. Zone management
 * (delivery-zone.executor.ts) intentionally stays admin-only — not scoped.
 */
export async function executeListDeliveryTariffs(): Promise<DeliveryTariffDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().deliveryTariffAdminService.listTariffs();
}

export async function executeCreateDeliveryTariff(
  data: CreateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().deliveryTariffAdminService.createTariff(data);
}

export async function executeUpdateDeliveryTariff(
  data: UpdateDeliveryTariffRequest,
): Promise<DeliveryTariffDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().deliveryTariffAdminService.updateTariff(data);
}

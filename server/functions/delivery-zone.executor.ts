import type {
  CreateDeliveryZoneRequest,
  DeliveryZoneDTO,
  UpdateDeliveryZoneRequest,
} from "@shared/contracts/delivery";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeListDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  return getServices().deliveryZoneService.listActive();
}

export async function executeListAdminDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  await requireAdminFromRequest();
  return getServices().deliveryZoneAdminService.listZones();
}

export async function executeCreateDeliveryZone(
  data: CreateDeliveryZoneRequest,
): Promise<DeliveryZoneDTO> {
  await requireAdminFromRequest();
  return getServices().deliveryZoneAdminService.createZone(data);
}

export async function executeUpdateDeliveryZone(
  data: UpdateDeliveryZoneRequest,
): Promise<DeliveryZoneDTO> {
  await requireAdminFromRequest();
  return getServices().deliveryZoneAdminService.updateZone(data);
}

export async function executeDeactivateDeliveryZone(id: string): Promise<DeliveryZoneDTO> {
  await requireAdminFromRequest();
  return getServices().deliveryZoneAdminService.deactivateZone(id);
}

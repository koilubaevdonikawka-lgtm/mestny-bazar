import type {
  CreateDeliveryZoneRequest,
  DeliveryZoneDTO,
  UpdateDeliveryZoneRequest,
} from "@shared/contracts/delivery";
import {
  createDeliveryZoneFn,
  deactivateDeliveryZoneFn,
  listAdminDeliveryZonesFn,
  listDeliveryZonesFn,
  updateDeliveryZoneFn,
} from "@/api/delivery-zone.functions";

export async function listDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  return listDeliveryZonesFn();
}

export async function listAdminDeliveryZones(): Promise<DeliveryZoneDTO[]> {
  return listAdminDeliveryZonesFn();
}

export async function createDeliveryZone(
  request: CreateDeliveryZoneRequest,
): Promise<DeliveryZoneDTO> {
  return createDeliveryZoneFn({ data: request });
}

export async function updateDeliveryZone(
  request: UpdateDeliveryZoneRequest,
): Promise<DeliveryZoneDTO> {
  return updateDeliveryZoneFn({ data: request });
}

export async function deactivateDeliveryZone(id: string): Promise<DeliveryZoneDTO> {
  return deactivateDeliveryZoneFn({ data: { id } });
}

import type {
  CreateDeliveryZoneRequest,
  DeliveryZoneDTO,
  UpdateDeliveryZoneRequest,
} from "@shared/contracts/delivery";

/** Admin-facing — sees active and inactive zones, unlike IDeliveryZoneRepository (buyer). */
export interface IAdminDeliveryZoneRepository {
  listAll(): Promise<DeliveryZoneDTO[]>;
  getById(id: string): Promise<DeliveryZoneDTO | null>;
  create(data: CreateDeliveryZoneRequest): Promise<DeliveryZoneDTO>;
  update(data: UpdateDeliveryZoneRequest): Promise<DeliveryZoneDTO>;
  /** Soft delete (is_active = false) — a zone may be referenced by existing orders/tariffs, never hard-deleted. */
  deactivate(id: string): Promise<DeliveryZoneDTO>;
}

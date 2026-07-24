import type {
  AdjustInventoryDto,
  CommitReservationDto,
  CreateInventoryItemDto,
  ReleaseReservationDto,
  ReserveInventoryDto,
} from "@server/application/modules/inventory/inventory/dto";
import type {
  InventoryItem,
  InventoryReservation,
} from "@server/application/modules/inventory/inventory/models";
import type { InventoryService } from "@server/application/modules/inventory/inventory/services";

/** Public entry point for the Inventory business capability module. */
export class InventoryModule {
  constructor(private readonly service: InventoryService) {}

  getInventory(productId: string): Promise<InventoryItem | null> {
    return this.service.getInventory(productId);
  }

  getAvailableQuantity(productId: string): Promise<number | null> {
    return this.service.getAvailableQuantity(productId);
  }

  reserve(dto: ReserveInventoryDto): Promise<InventoryReservation> {
    return this.service.reserve(dto);
  }

  releaseReservation(dto: ReleaseReservationDto): Promise<InventoryReservation> {
    return this.service.releaseReservation(dto);
  }

  commitReservation(dto: CommitReservationDto): Promise<InventoryReservation> {
    return this.service.commitReservation(dto);
  }

  adjustQuantity(dto: AdjustInventoryDto): Promise<InventoryItem> {
    return this.service.adjustQuantity(dto);
  }

  createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    return this.service.createInventoryItem(dto);
  }
}

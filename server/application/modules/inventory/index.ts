export { InventoryModule } from "./inventory";
export type { IInventoryStore } from "./inventory/contracts";
export type {
  CreateInventoryItemDto,
  ReserveInventoryDto,
  ReleaseReservationDto,
  CommitReservationDto,
  AdjustInventoryDto,
} from "./inventory/dto";
export {
  type InventoryReservedEvent,
  type InventoryReleasedEvent,
  type InventoryCommittedEvent,
  type InventoryAdjustedEvent,
  createInventoryReservedEvent,
  createInventoryReleasedEvent,
  createInventoryCommittedEvent,
  createInventoryAdjustedEvent,
} from "./inventory/events";
export {
  InventoryStatus,
  INVENTORY_STATUS_VALUES,
  InventoryReservationStatus,
  isInventoryStatus,
  isActiveInventoryReservation,
  InventoryMovementType,
  type InventoryStatusValue,
  type InventoryReservationStatusValue,
  type InventoryMovementTypeValue,
  type InventoryItem,
  type InventoryReservation,
  type InventoryMovement,
  createInventoryItem,
  createInventoryReservation,
  createInventoryMovement,
  withInventoryQuantity,
  withInventoryReservedQuantity,
  withInventoryReservationStatus,
  getAvailableInventoryQuantity,
} from "./inventory/models";
export { InventoryService } from "./inventory/services";

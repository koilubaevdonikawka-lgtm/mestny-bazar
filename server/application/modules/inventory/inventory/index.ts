export { InventoryModule } from "./api";
export type { IInventoryStore } from "./contracts";
export type {
  CreateInventoryItemDto,
  ReserveInventoryDto,
  ReleaseReservationDto,
  CommitReservationDto,
  AdjustInventoryDto,
} from "./dto";
export {
  type InventoryReservedEvent,
  type InventoryReleasedEvent,
  type InventoryCommittedEvent,
  type InventoryAdjustedEvent,
  createInventoryReservedEvent,
  createInventoryReleasedEvent,
  createInventoryCommittedEvent,
  createInventoryAdjustedEvent,
} from "./events";
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
} from "./models";
export { InventoryService } from "./services";

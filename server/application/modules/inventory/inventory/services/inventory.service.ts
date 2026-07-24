import type { IInventoryStore } from "@server/application/modules/inventory/inventory/contracts";
import type {
  AdjustInventoryDto,
  CommitReservationDto,
  CreateInventoryItemDto,
  ReleaseReservationDto,
  ReserveInventoryDto,
} from "@server/application/modules/inventory/inventory/dto";
import {
  createInventoryAdjustedEvent,
  createInventoryCommittedEvent,
  createInventoryReleasedEvent,
  createInventoryReservedEvent,
} from "@server/application/modules/inventory/inventory/events";
import {
  createInventoryItem,
  createInventoryMovement,
  createInventoryReservation,
  getAvailableInventoryQuantity,
  InventoryMovementType,
  InventoryReservationStatus,
  isActiveInventoryReservation,
  withInventoryQuantity,
  withInventoryReservedQuantity,
  withInventoryReservationStatus,
  type InventoryItem,
  type InventoryReservation,
} from "@server/application/modules/inventory/inventory/models";
import type { IIdGenerator } from "@server/application/ports";

/** Inventory business capability service — orchestrates stock via IInventoryStore. */
export class InventoryService {
  constructor(
    private readonly store: IInventoryStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createInventoryItem(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    validateProductId(dto.productId);

    const existing = await this.store.findInventoryItemByProductId(dto.productId);
    if (existing) {
      throw new Error(`Inventory item already exists for product ${dto.productId}.`);
    }

    const item = createInventoryItem({
      productId: dto.productId,
      quantity: dto.quantity,
    });

    await this.store.saveInventoryItem(item);
    return item;
  }

  async getInventory(productId: string): Promise<InventoryItem | null> {
    return this.store.findInventoryItemByProductId(productId.trim());
  }

  async getAvailableQuantity(productId: string): Promise<number | null> {
    const item = await this.store.findInventoryItemByProductId(productId.trim());
    if (!item) {
      return null;
    }
    return getAvailableInventoryQuantity(item);
  }

  async reserve(dto: ReserveInventoryDto): Promise<InventoryReservation> {
    validateProductId(dto.productId);
    if (!Number.isInteger(dto.quantity) || dto.quantity <= 0) {
      throw new Error("Reservation quantity must be a positive integer.");
    }

    const item = await this.requireInventoryItem(dto.productId);
    const available = getAvailableInventoryQuantity(item);
    if (available < dto.quantity) {
      throw new Error(
        `Insufficient inventory for product ${dto.productId}: requested ${dto.quantity}, available ${available}.`,
      );
    }

    const reservation = createInventoryReservation({
      id: this.idGenerator.generate(),
      productId: item.productId,
      quantity: dto.quantity,
      referenceId: dto.referenceId,
    });

    const updatedItem = withInventoryReservedQuantity(
      item,
      item.reservedQuantity + dto.quantity,
    );

    await this.store.updateInventoryItem(updatedItem);
    await this.store.saveReservation(reservation);
    await this.store.saveMovement(
      createInventoryMovement({
        id: this.idGenerator.generate(),
        productId: item.productId,
        type: InventoryMovementType.Reserve,
        quantityDelta: -dto.quantity,
        previousQuantity: available,
        nextQuantity: getAvailableInventoryQuantity(updatedItem),
        referenceId: reservation.id,
      }),
    );
    createInventoryReservedEvent(reservation);

    return reservation;
  }

  async releaseReservation(dto: ReleaseReservationDto): Promise<InventoryReservation> {
    const reservation = await this.requireActiveReservation(dto.reservationId);
    const item = await this.requireInventoryItem(reservation.productId);
    const availableBefore = getAvailableInventoryQuantity(item);

    const updatedItem = withInventoryReservedQuantity(
      item,
      item.reservedQuantity - reservation.quantity,
    );
    const released = withInventoryReservationStatus(
      reservation,
      InventoryReservationStatus.Released,
    );

    await this.store.updateInventoryItem(updatedItem);
    await this.store.updateReservation(released);
    await this.store.saveMovement(
      createInventoryMovement({
        id: this.idGenerator.generate(),
        productId: item.productId,
        type: InventoryMovementType.Release,
        quantityDelta: reservation.quantity,
        previousQuantity: availableBefore,
        nextQuantity: getAvailableInventoryQuantity(updatedItem),
        referenceId: reservation.id,
      }),
    );
    createInventoryReleasedEvent(released);

    return released;
  }

  async commitReservation(dto: CommitReservationDto): Promise<InventoryReservation> {
    const reservation = await this.requireActiveReservation(dto.reservationId);
    const item = await this.requireInventoryItem(reservation.productId);
    const availableBefore = getAvailableInventoryQuantity(item);

    const nextQuantity = item.quantity - reservation.quantity;
    const updatedItem = withInventoryQuantity(
      withInventoryReservedQuantity(item, item.reservedQuantity - reservation.quantity),
      nextQuantity,
    );
    const committed = withInventoryReservationStatus(
      reservation,
      InventoryReservationStatus.Committed,
    );

    await this.store.updateInventoryItem(updatedItem);
    await this.store.updateReservation(committed);
    await this.store.saveMovement(
      createInventoryMovement({
        id: this.idGenerator.generate(),
        productId: item.productId,
        type: InventoryMovementType.Commit,
        quantityDelta: -reservation.quantity,
        previousQuantity: availableBefore,
        nextQuantity: getAvailableInventoryQuantity(updatedItem),
        referenceId: reservation.id,
      }),
    );
    createInventoryCommittedEvent(committed);

    return committed;
  }

  async adjustQuantity(dto: AdjustInventoryDto): Promise<InventoryItem> {
    validateProductId(dto.productId);
    if (!Number.isInteger(dto.quantityDelta)) {
      throw new Error("Inventory adjustment delta must be an integer.");
    }

    const item = await this.requireInventoryItem(dto.productId);
    const availableBefore = getAvailableInventoryQuantity(item);
    const nextQuantity = item.quantity + dto.quantityDelta;

    if (nextQuantity < item.reservedQuantity) {
      throw new Error(
        `Inventory adjustment would drop on-hand quantity below reserved amount for product ${dto.productId}.`,
      );
    }
    if (nextQuantity < 0) {
      throw new Error(`Inventory quantity cannot be negative for product ${dto.productId}.`);
    }

    const updatedItem = withInventoryQuantity(item, nextQuantity);
    const movement = createInventoryMovement({
      id: this.idGenerator.generate(),
      productId: item.productId,
      type: InventoryMovementType.Adjust,
      quantityDelta: dto.quantityDelta,
      previousQuantity: availableBefore,
      nextQuantity: getAvailableInventoryQuantity(updatedItem),
      referenceId: dto.referenceId,
    });

    await this.store.updateInventoryItem(updatedItem);
    await this.store.saveMovement(movement);
    createInventoryAdjustedEvent(updatedItem, movement);

    return updatedItem;
  }

  private async requireInventoryItem(productId: string): Promise<InventoryItem> {
    const item = await this.store.findInventoryItemByProductId(productId.trim());
    if (!item) {
      throw new Error(`Inventory item not found for product ${productId}.`);
    }
    return item;
  }

  private async requireActiveReservation(reservationId: string): Promise<InventoryReservation> {
    const reservation = await this.store.findReservationById(reservationId.trim());
    if (!reservation) {
      throw new Error(`Inventory reservation not found: ${reservationId}.`);
    }
    if (!isActiveInventoryReservation(reservation.status)) {
      throw new Error(`Inventory reservation ${reservationId} is not active.`);
    }
    return reservation;
  }
}

function validateProductId(productId: string): void {
  if (!productId?.trim()) {
    throw new Error("Product id is required.");
  }
}

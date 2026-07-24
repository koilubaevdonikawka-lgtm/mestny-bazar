/** Inventory movement types recorded by the Inventory capability module. */
export const InventoryMovementType = {
  Reserve: "reserve",
  Release: "release",
  Commit: "commit",
  Adjust: "adjust",
} as const;

export type InventoryMovementTypeValue =
  (typeof InventoryMovementType)[keyof typeof InventoryMovementType];

/** Inventory movement audit record. */
export interface InventoryMovement {
  readonly id: string;
  readonly productId: string;
  readonly type: InventoryMovementTypeValue;
  readonly quantityDelta: number;
  readonly previousQuantity: number;
  readonly nextQuantity: number;
  readonly referenceId: string | null;
  readonly occurredAt: string;
}

export function createInventoryMovement(input: {
  id: string;
  productId: string;
  type: InventoryMovementTypeValue;
  quantityDelta: number;
  previousQuantity: number;
  nextQuantity: number;
  referenceId?: string | null;
}): InventoryMovement {
  return Object.freeze({
    id: input.id.trim(),
    productId: input.productId.trim(),
    type: input.type,
    quantityDelta: input.quantityDelta,
    previousQuantity: input.previousQuantity,
    nextQuantity: input.nextQuantity,
    referenceId: input.referenceId?.trim() || null,
    occurredAt: new Date().toISOString(),
  });
}

/** Picking list line item for warehouse assembly. */
export interface PickingListItem {
  readonly productId: string;
  readonly sellerId: string;
  readonly name: string;
  readonly quantity: number;
}

/** Picking list assigned to a warehouse task. */
export interface PickingList {
  readonly items: readonly PickingListItem[];
}

export function createPickingList(items: readonly PickingListItem[]): PickingList {
  return Object.freeze({
    items: Object.freeze(
      items.map((item) =>
        Object.freeze({
          productId: item.productId.trim(),
          sellerId: item.sellerId.trim(),
          name: item.name.trim(),
          quantity: item.quantity,
        }),
      ),
    ),
  });
}

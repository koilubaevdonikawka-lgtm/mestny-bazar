/** Read-only order snapshot for picking task initiation and validation. */
export interface OrderWarehouseSnapshot {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
  readonly pickable: boolean;
}

/**
 * Read-only order access for Warehouse Management.
 * Implemented by an adapter over Order Management — no Order Repository access.
 */
export interface IOrderWarehouseReader {
  getOrderForPicking(orderId: string): Promise<OrderWarehouseSnapshot | null>;
}

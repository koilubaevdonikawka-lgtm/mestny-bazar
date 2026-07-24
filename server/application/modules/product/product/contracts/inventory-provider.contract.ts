/** Inventory port for stock availability — implemented by infrastructure adapters. */
export interface IInventoryProvider {
  getAvailableStock(productId: string): Promise<number | null>;
  setStock(productId: string, quantity: number): Promise<void>;
}

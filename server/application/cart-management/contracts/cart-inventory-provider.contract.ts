/** Cart inventory checks — replace with Inventory BCM later. */
export interface ICartInventoryProvider {
  getAvailableStock(productId: string): Promise<number>;
  canFulfill(productId: string, quantity: number): Promise<boolean>;
}

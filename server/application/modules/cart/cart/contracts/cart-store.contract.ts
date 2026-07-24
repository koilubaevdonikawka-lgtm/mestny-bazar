import type { CartSnapshot } from "@server/application/modules/cart/cart/models";

/** Cart persistence contract — implemented by infrastructure adapters. */
export interface ICartStore {
  loadCart(customerId: string): Promise<CartSnapshot | null>;
  saveCart(snapshot: CartSnapshot): Promise<void>;
  deleteCart(customerId: string): Promise<void>;
}

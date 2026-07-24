import type { CartLine } from "@server/application/cart-management/models/cart-line.model";

/** Persists cart line positions only — no product data. */
export interface ICartRepository {
  findByCustomerId(customerId: string): Promise<readonly CartLine[]>;
  addItem(customerId: string, productId: string, quantity: number): Promise<CartLine>;
  updateQuantity(customerId: string, productId: string, quantity: number): Promise<CartLine | null>;
  removeItem(customerId: string, productId: string): Promise<boolean>;
  clear(customerId: string): Promise<number>;
}

import type { CartDTO, CartLineIdentifier } from "@shared/contracts/cart";

export interface CartLineUpsertInput extends CartLineIdentifier {
  quantity: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export interface ICartRepository {
  getByUserId(userId: string): Promise<CartDTO>;
  /** Atomically get-or-creates the user's cart and increments/inserts each line. */
  upsertItems(userId: string, items: CartLineUpsertInput[]): Promise<CartDTO>;
  /** Sets an absolute quantity for one existing line. */
  updateQuantity(
    userId: string,
    identifier: CartLineIdentifier,
    quantity: number,
  ): Promise<CartDTO>;
  removeItem(userId: string, identifier: CartLineIdentifier): Promise<CartDTO>;
  clear(userId: string): Promise<void>;
}

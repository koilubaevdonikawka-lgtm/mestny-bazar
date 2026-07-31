import type {
  CartDTO,
  CartLineIdentifier,
  CartLineInput,
  CartValidationResult,
} from "@shared/contracts/cart";
import {
  addCartItemFn,
  clearCartFn,
  getCartFn,
  mergeGuestCartFn,
  removeCartItemFn,
  updateCartItemFn,
  validateCartFn,
} from "@/api/cart.functions";

export async function validateCart(lines: CartLineInput[]): Promise<CartValidationResult> {
  return validateCartFn({ data: { lines } });
}

export async function getCart(): Promise<CartDTO> {
  return getCartFn();
}

export async function addCartItem(line: CartLineInput): Promise<CartDTO> {
  return addCartItemFn({ data: line });
}

export async function updateCartItem(
  identifier: CartLineIdentifier,
  quantity: number,
): Promise<CartDTO> {
  return updateCartItemFn({ data: { ...identifier, quantity } });
}

export async function removeCartItem(identifier: CartLineIdentifier): Promise<CartDTO> {
  return removeCartItemFn({ data: identifier });
}

export async function clearCart(): Promise<void> {
  await clearCartFn();
}

export async function mergeGuestCart(lines: CartLineInput[]): Promise<CartDTO> {
  if (!lines.length) return getCart();
  return mergeGuestCartFn({ data: { lines } });
}

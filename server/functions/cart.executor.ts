import type {
  CartDTO,
  CartLineIdentifier,
  CartLineInput,
  CartValidationResult,
} from "@shared/contracts/cart";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

/** Guest-callable — validates cart contents against IProductRepository, no auth required. */
export async function executeValidateCart(lines: CartLineInput[]): Promise<CartValidationResult> {
  return getServices().cartService.validate(lines);
}

export async function executeGetCart(): Promise<CartDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().cartService.getCart(userId);
}

export async function executeAddCartItem(line: CartLineInput): Promise<CartDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().cartService.addItem(userId, line);
}

export async function executeUpdateCartItem(
  identifier: CartLineIdentifier,
  quantity: number,
): Promise<CartDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().cartService.updateQuantity(userId, identifier, quantity);
}

export async function executeRemoveCartItem(identifier: CartLineIdentifier): Promise<CartDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().cartService.removeItem(userId, identifier);
}

export async function executeClearCart(): Promise<void> {
  const userId = await requireUserIdFromRequest();
  await getServices().cartService.clear(userId);
}

/** Called once right after sign-in to fold the local guest cart into the server cart. */
export async function executeMergeGuestCart(lines: CartLineInput[]): Promise<CartDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().cartService.mergeGuestItems(userId, lines);
}

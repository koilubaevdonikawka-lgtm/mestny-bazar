import type { AddCartItemDto } from "@server/application/modules/cart/cart/dto";
import type { CartSnapshot } from "@server/application/modules/cart/cart/models";
import type { CartService } from "@server/application/modules/cart/cart/services";

/** Public entry point for the Cart business capability module. */
export class CartModule {
  constructor(private readonly service: CartService) {}

  getCart(customerId: string): Promise<CartSnapshot> {
    return this.service.getCart(customerId);
  }

  addItem(input: AddCartItemDto): Promise<CartSnapshot> {
    return this.service.addItem(input);
  }

  changeQuantity(customerId: string, productId: string, quantity: number): Promise<CartSnapshot> {
    return this.service.changeQuantity(customerId, productId, quantity);
  }

  removeItem(customerId: string, productId: string): Promise<CartSnapshot> {
    return this.service.removeItem(customerId, productId);
  }

  clearCart(customerId: string): Promise<CartSnapshot> {
    return this.service.clearCart(customerId);
  }
}

import type { CartLine } from "@server/application/cart-management/models/cart-line.model";
import type {
  CartTotalResult,
  CartValidationResult,
  CartView,
  ClearCartResult,
  RemoveCartItemResult,
} from "@server/application/cart-management/models/cart-view.model";
import type { CartManagementService } from "@server/application/cart-management/services/cart-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class AddProductToCartUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(
    customerId: string,
    productId: string,
    quantity = 1,
  ): Promise<UseCaseResult<CartLine>> {
    return this.cart.addProduct(customerId, productId, quantity).then(useCaseResult);
  }
}

export class UpdateCartItemQuantityUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(
    customerId: string,
    productId: string,
    quantity: number,
  ): Promise<UseCaseResult<CartLine | RemoveCartItemResult>> {
    return this.cart.updateQuantity(customerId, productId, quantity).then(useCaseResult);
  }
}

export class RemoveProductFromCartUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(
    customerId: string,
    productId: string,
  ): Promise<UseCaseResult<RemoveCartItemResult>> {
    return this.cart.removeProduct(customerId, productId).then(useCaseResult);
  }
}

export class GetCartUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CartView>> {
    return this.cart.getCart(customerId).then(useCaseResult);
  }
}

export class ClearCartUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<ClearCartResult>> {
    return this.cart.clearCart(customerId).then(useCaseResult);
  }
}

export class CalculateCartTotalUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CartTotalResult>> {
    return this.cart.calculateTotal(customerId).then(useCaseResult);
  }
}

export class ValidateCartUseCase {
  constructor(private readonly cart: CartManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CartValidationResult>> {
    return this.cart.validateCart(customerId).then(useCaseResult);
  }
}

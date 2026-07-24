import {
  AddProductToCartUseCase,
  CalculateCartTotalUseCase,
  ClearCartUseCase,
  GetCartUseCase,
  RemoveProductFromCartUseCase,
  UpdateCartItemQuantityUseCase,
  ValidateCartUseCase,
} from "@server/application/cart-management/use-cases/cart-management.use-cases";

/** Application facade for cart management scenario. */
export class CartManagementApplicationService {
  constructor(
    private readonly addProductToCartUseCase: AddProductToCartUseCase,
    private readonly updateCartItemQuantityUseCase: UpdateCartItemQuantityUseCase,
    private readonly removeProductFromCartUseCase: RemoveProductFromCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly calculateCartTotalUseCase: CalculateCartTotalUseCase,
    private readonly validateCartUseCase: ValidateCartUseCase,
  ) {}

  addItem(customerId: string, productId: string, quantity?: number) {
    return this.addProductToCartUseCase.execute(customerId, productId, quantity);
  }

  updateQuantity(customerId: string, productId: string, quantity: number) {
    return this.updateCartItemQuantityUseCase.execute(customerId, productId, quantity);
  }

  removeItem(customerId: string, productId: string) {
    return this.removeProductFromCartUseCase.execute(customerId, productId);
  }

  getCart(customerId: string) {
    return this.getCartUseCase.execute(customerId);
  }

  clear(customerId: string) {
    return this.clearCartUseCase.execute(customerId);
  }

  calculateTotal(customerId: string) {
    return this.calculateCartTotalUseCase.execute(customerId);
  }

  validate(customerId: string) {
    return this.validateCartUseCase.execute(customerId);
  }
}

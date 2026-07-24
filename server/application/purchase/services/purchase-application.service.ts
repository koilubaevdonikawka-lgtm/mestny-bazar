import type {
  AddToCartInput,
  BrowseCatalogInput,
  CheckoutInput,
  CompletePurchaseInput,
  CompletePurchaseResult,
  PayOrderInput,
  UpdateCartInput,
} from "@server/application/purchase/dto";
import {
  AddToCartUseCase,
  BrowseCatalogUseCase,
  CheckoutUseCase,
  NotifyCourierUseCase,
  NotifyWarehouseUseCase,
  PayOrderUseCase,
  PurchaseCreateOrderUseCase,
  UpdateCartUseCase,
  ViewProductUseCase,
} from "@server/application/purchase/use-cases";
import { PurchaseFlowService } from "@server/application/purchase/services/purchase-flow.service";

/** Application facade for the vertical purchase scenario. */
export class PurchaseApplicationService {
  constructor(
    private readonly browseCatalogUseCase: BrowseCatalogUseCase,
    private readonly viewProductUseCase: ViewProductUseCase,
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly updateCartUseCase: UpdateCartUseCase,
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly createOrderUseCase: PurchaseCreateOrderUseCase,
    private readonly payOrderUseCase: PayOrderUseCase,
    private readonly notifyWarehouseUseCase: NotifyWarehouseUseCase,
    private readonly notifyCourierUseCase: NotifyCourierUseCase,
    private readonly flow: PurchaseFlowService,
  ) {}

  browseCatalog(input: BrowseCatalogInput = {}) {
    return this.browseCatalogUseCase.execute(input);
  }

  viewProduct(productId: string) {
    return this.viewProductUseCase.execute(productId);
  }

  addToCart(input: AddToCartInput) {
    return this.addToCartUseCase.execute(input);
  }

  updateCart(input: UpdateCartInput) {
    return this.updateCartUseCase.execute(input);
  }

  checkout(input: CheckoutInput) {
    return this.checkoutUseCase.execute(input);
  }

  createOrder(sessionId: string) {
    return this.createOrderUseCase.execute({ sessionId });
  }

  payOrder(input: PayOrderInput) {
    return this.payOrderUseCase.execute(input);
  }

  notifyWarehouse(orderInput: Parameters<NotifyWarehouseUseCase["execute"]>[0]) {
    return this.notifyWarehouseUseCase.execute(orderInput);
  }

  notifyCourier(orderInput: Parameters<NotifyCourierUseCase["execute"]>[0]) {
    return this.notifyCourierUseCase.execute(orderInput);
  }

  completePurchase(input: CompletePurchaseInput): Promise<CompletePurchaseResult> {
    return this.flow.completePurchase(input);
  }
}

import type { CartModule } from "@server/application/modules/cart/cart/api/cart.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { AddToCartInput, AddToCartResult } from "@server/application/purchase/dto";

/** Add a product to the customer cart via Cart BCM. */
export class AddToCartUseCase {
  constructor(private readonly cart: CartModule) {}

  async execute(input: AddToCartInput): Promise<UseCaseResult<AddToCartResult>> {
    const snapshot = await this.cart.addItem(input);
    return useCaseResult(snapshot);
  }
}

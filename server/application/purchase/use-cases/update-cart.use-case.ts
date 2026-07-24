import type { CartModule } from "@server/application/modules/cart/cart/api/cart.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { UpdateCartInput, UpdateCartResult } from "@server/application/purchase/dto";

/** Update cart item quantity via Cart BCM. */
export class UpdateCartUseCase {
  constructor(private readonly cart: CartModule) {}

  async execute(input: UpdateCartInput): Promise<UseCaseResult<UpdateCartResult>> {
    const snapshot = await this.cart.changeQuantity(
      input.customerId,
      input.productId,
      input.quantity,
    );
    return useCaseResult(snapshot);
  }
}

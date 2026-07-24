import type { CheckoutModule } from "@server/application/modules/checkout/checkout/api/checkout.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { CreateOrderInput, CreateOrderResult } from "@server/application/purchase/dto";

/** Place order from a validated checkout session via Checkout BPM. */
export class PurchaseCreateOrderUseCase {
  constructor(private readonly checkout: CheckoutModule) {}

  async execute(input: CreateOrderInput): Promise<UseCaseResult<CreateOrderResult>> {
    const result = await this.checkout.placeOrder(input.sessionId.trim());
    return useCaseResult(result);
  }
}

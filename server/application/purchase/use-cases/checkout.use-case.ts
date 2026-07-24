import type { CheckoutModule } from "@server/application/modules/checkout/checkout/api/checkout.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { CheckoutInput, CheckoutUseCaseResult } from "@server/application/purchase/dto";

/** Start checkout session and validate cart via Checkout BPM. */
export class CheckoutUseCase {
  constructor(private readonly checkout: CheckoutModule) {}

  async execute(input: CheckoutInput): Promise<UseCaseResult<CheckoutUseCaseResult>> {
    const session = await this.checkout.createCheckout(input);
    const validation = await this.checkout.validateCheckout(session.id);

    return useCaseResult(
      Object.freeze({
        session,
        validation,
      }),
    );
  }
}

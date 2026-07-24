import type {
  CancelCheckoutResult,
  CheckoutSummary,
  CheckoutValidationResult,
} from "@server/application/checkout-management/models/checkout-view.model";
import type { CheckoutManagementService } from "@server/application/checkout-management/services/checkout-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateCheckoutUseCase {
  constructor(private readonly checkout: CheckoutManagementService) {}

  execute(customerId: string): Promise<UseCaseResult<CheckoutSummary>> {
    return this.checkout.createCheckout(customerId).then(useCaseResult);
  }
}

export class ValidateCheckoutUseCase {
  constructor(private readonly checkout: CheckoutManagementService) {}

  execute(
    customerId: string,
    checkoutId?: string,
  ): Promise<UseCaseResult<CheckoutValidationResult>> {
    return this.checkout.validateCheckout(customerId, checkoutId).then(useCaseResult);
  }
}

export class GetCheckoutSummaryUseCase {
  constructor(private readonly checkout: CheckoutManagementService) {}

  async execute(checkoutId: string): Promise<UseCaseResult<CheckoutSummary | null>> {
    return useCaseResult(await this.checkout.getCheckoutSummary(checkoutId));
  }
}

export class RefreshCheckoutUseCase {
  constructor(private readonly checkout: CheckoutManagementService) {}

  execute(customerId: string, checkoutId: string): Promise<UseCaseResult<CheckoutSummary>> {
    return this.checkout.refreshCheckout(customerId, checkoutId).then(useCaseResult);
  }
}

export class CancelCheckoutUseCase {
  constructor(private readonly checkout: CheckoutManagementService) {}

  execute(customerId: string, checkoutId: string): Promise<UseCaseResult<CancelCheckoutResult>> {
    return this.checkout.cancelCheckout(customerId, checkoutId).then(useCaseResult);
  }
}

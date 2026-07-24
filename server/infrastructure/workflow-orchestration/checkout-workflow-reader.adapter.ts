import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type {
  CheckoutWorkflowSnapshot,
  ICheckoutWorkflowReader,
} from "@server/application/workflow-orchestration/contracts/checkout-workflow-reader.contract";

/** Adapts Checkout Management Application Service to ICheckoutWorkflowReader. */
export class CheckoutWorkflowReaderAdapter implements ICheckoutWorkflowReader {
  constructor(private readonly checkout: CheckoutManagementApplicationService) {}

  async validateForOrder(
    customerId: string,
    checkoutId: string,
  ): Promise<CheckoutWorkflowSnapshot> {
    const validation = await this.checkout.validate(customerId, checkoutId);
    const summary = await this.checkout.getSummary(checkoutId);

    return Object.freeze({
      checkoutId,
      customerId,
      valid: validation.value.valid,
      ready: validation.value.ready && (summary.value?.ready ?? false),
    });
  }
}

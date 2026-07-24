import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { CheckoutModule } from "@server/application/modules/checkout/checkout/api/checkout.module";
import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const PaymentScenarioId = "payment";

/** End-to-end payment flow using public Module APIs only. */
export class PaymentScenario implements ITestScenario {
  readonly id = PaymentScenarioId;
  readonly name = "Payment Flow";
  readonly category = "payment";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.customer.id, "Customer fixture must be seeded");
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");

    const checkoutModule = context.resolveModule<CheckoutModule>(BootstrapTokens.CheckoutModule);
    const paymentModule = context.resolveModule<PaymentModule>(BootstrapTokens.PaymentModule);

    const session = await checkoutModule.createCheckout({
      customerId: fixtures.customer.id!,
      paymentMethod: "finik",
      deliveryMethod: "courier",
    });
    const checkoutResult = await checkoutModule.placeOrder(session.id);
    assertions.assertSuccess(checkoutResult.orderId, "Order must exist before payment");

    const payment = await paymentModule.createPayment({
      orderId: checkoutResult.orderId,
      amount: fixtures.payment?.amount ?? fixtures.product.priceAmount,
      currency: fixtures.payment?.currency ?? fixtures.product.priceCurrency,
      method: fixtures.payment?.method ?? "finik",
      idempotencyKey: `payment-${checkoutResult.orderId}`,
    });
    assertions.assertSuccess(payment.id, "Payment must be created");

    const stored = await paymentModule.getPayment(payment.id);
    assertions.assertSuccess(stored, "Payment must be retrievable");
    assertions.assertEquals(stored!.orderId, checkoutResult.orderId);
  }
}

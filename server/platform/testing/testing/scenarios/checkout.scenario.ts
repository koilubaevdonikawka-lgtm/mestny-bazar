import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { CartModule } from "@server/application/modules/cart/cart/api/cart.module";
import type { CheckoutModule } from "@server/application/modules/checkout/checkout/api/checkout.module";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const CheckoutScenarioId = "checkout";

/** End-to-end checkout flow using public Module APIs only. */
export class CheckoutScenario implements ITestScenario {
  readonly id = CheckoutScenarioId;
  readonly name = "Checkout Flow";
  readonly category = "checkout";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.customer.id, "Customer fixture must be seeded");
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");

    const cartModule = context.resolveModule<CartModule>(BootstrapTokens.CartModule);
    const checkoutModule = context.resolveModule<CheckoutModule>(BootstrapTokens.CheckoutModule);

    const cart = await cartModule.addItem({
      customerId: fixtures.customer.id!,
      productId: fixtures.product.id!,
      quantity: 1,
    });
    assertions.assertSuccess(cart.items.length > 0, "Cart must contain items");

    const session = await checkoutModule.createCheckout({
      customerId: fixtures.customer.id!,
      paymentMethod: "finik",
      deliveryMethod: "courier",
    });
    assertions.assertSuccess(session.id, "Checkout session must be created");

    const validation = await checkoutModule.validateCheckout(session.id);
    assertions.assertSuccess(validation.valid, "Checkout validation must pass");

    const result = await checkoutModule.placeOrder(session.id);
    assertions.assertSuccess(result.orderId, "Order must be created from checkout");
  }
}

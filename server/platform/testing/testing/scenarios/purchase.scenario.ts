import { BootstrapTokens } from "@server/bootstrap/tokens";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { PurchaseApplicationService } from "@server/application/purchase/services/purchase-application.service";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const PurchaseScenarioId = "purchase";

/** End-to-end purchase vertical slice via PurchaseApplicationService. */
export class PurchaseScenario implements ITestScenario {
  readonly id = PurchaseScenarioId;
  readonly name = "Purchase Flow";
  readonly category = "purchase";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.customer.id, "Customer fixture must be seeded");
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");

    const purchase = context.resolveModule<PurchaseApplicationService>(
      InfrastructureTokens.PurchaseApplicationService,
    );

    const catalog = (await purchase.browseCatalog({ limit: 10 })).value;
    assertions.assertSuccess(Array.isArray(catalog.items), "Catalog browse must return items");

    const product = (await purchase.viewProduct(fixtures.product.id!)).value;
    assertions.assertSuccess(product?.id, "Product must be viewable");

    const cart = (
      await purchase.addToCart({
        customerId: fixtures.customer.id!,
        productId: fixtures.product.id!,
        quantity: 1,
      })
    ).value;
    assertions.assertSuccess(cart.items.length > 0, "Cart must contain items");

    const updatedCart = (
      await purchase.updateCart({
        customerId: fixtures.customer.id!,
        productId: fixtures.product.id!,
        quantity: 2,
      })
    ).value;
    assertions.assertSuccess(
      updatedCart.items.some((item) => item.quantity === 2),
      "Cart quantity must be updated",
    );

    const checkout = (
      await purchase.checkout({
        customerId: fixtures.customer.id!,
        paymentMethod: "cash",
        deliveryMethod: "courier",
      })
    ).value;
    assertions.assertSuccess(checkout.session.id, "Checkout session must be created");
    assertions.assertSuccess(checkout.validation.valid, "Checkout validation must pass");

    const completed = await purchase.completePurchase({
      sessionId: checkout.session.id,
      confirmCash: true,
    });

    assertions.assertSuccess(completed.checkout.order.id, "Order must be created");
    assertions.assertSuccess(completed.payment.payment.id, "Payment must be processed");
    assertions.assertSuccess(completed.fulfillment?.orderId, "Fulfillment must run after cash payment");

    const orderModule = context.resolveModule(BootstrapTokens.OrderModule);
    const order = await orderModule.getOrder(completed.checkout.order.id);
    assertions.assertSuccess(order?.status, "Order status must be updated after fulfillment");
  }
}

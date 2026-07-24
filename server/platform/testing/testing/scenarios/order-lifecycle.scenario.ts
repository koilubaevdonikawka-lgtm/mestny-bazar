import { BootstrapTokens } from "@server/bootstrap/tokens";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { OrderStatus } from "@server/application/modules/order/order/models";
import type { CourierModule } from "@server/application/modules/courier/courier/api/courier.module";
import type { OrderLifecycleApplicationService } from "@server/application/order-lifecycle/services/order-lifecycle-application.service";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { PaymentModule } from "@server/application/modules/payment/payment/api/payment.module";
import { PaymentStatus } from "@server/application/modules/payment/payment/models";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const OrderLifecycleScenarioId = "order-lifecycle";

/** Validates order lifecycle transitions, timeline, return and refund branches. */
export class OrderLifecycleScenario implements ITestScenario {
  readonly id = OrderLifecycleScenarioId;
  readonly name = "Order Lifecycle";
  readonly category = "order-lifecycle";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;
    assertions.assertSuccess(fixtures.customer.id, "Customer fixture must be seeded");
    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");
    assertions.assertSuccess(fixtures.seller.id, "Seller fixture must be seeded");

    const orders = context.resolveModule<OrderModule>(BootstrapTokens.OrderModule);
    const couriers = context.resolveModule<CourierModule>(BootstrapTokens.CourierModule);
    const lifecycle = context.resolveModule<OrderLifecycleApplicationService>(
      InfrastructureTokens.OrderLifecycleApplicationService,
    );
    const payments = context.resolveModule<PaymentModule>(BootstrapTokens.PaymentModule);

    const courier = await couriers.createCourier({
      name: "Lifecycle Courier",
      phone: "+996702000000",
    });

    let order = await orders.createOrder({
      customerId: fixtures.customer.id!,
      address: "Test address 1",
      phone: "+996700000000",
      paymentMethod: "cash",
      deliveryMethod: "courier",
      currency: "KGS",
      items: [
        {
          productId: fixtures.product.id!,
          sellerId: fixtures.seller.id!,
          catalogId: "catalog-default",
          name: "Lifecycle Product",
          priceAmount: 100,
          currency: "KGS",
          quantity: 1,
        },
      ],
    });

    const invalidAssign = await lifecycle
      .assignCourier({ orderId: order.id, courierId: courier.id })
      .then(() => false)
      .catch(() => true);
    assertions.assertSuccess(invalidAssign, "Assign courier from Draft must be blocked");

    for (const status of [
      OrderStatus.PendingPayment,
      OrderStatus.Paid,
      OrderStatus.Preparing,
      OrderStatus.ReadyForDelivery,
    ]) {
      order = await orders.updateOrderStatus({ orderId: order.id, status });
    }

    order = (await lifecycle.assignCourier({ orderId: order.id, courierId: courier.id })).value;
    order = (await lifecycle.acceptDelivery({ orderId: order.id })).value;
    order = (await lifecycle.startDelivery({ orderId: order.id })).value;
    order = (await lifecycle.arriveToCustomer({ orderId: order.id })).value;
    order = (await lifecycle.completeDelivery({ orderId: order.id })).value;
    assertions.assertSuccess(order.status === OrderStatus.Completed, "Order must reach Completed");

    const duplicateDeliveryFailed = await lifecycle
      .completeDelivery({ orderId: order.id })
      .then(() => false)
      .catch(() => true);
    assertions.assertSuccess(duplicateDeliveryFailed, "Duplicate delivery must be blocked");

    order = (await lifecycle.returnOrder({ orderId: order.id, reason: "Damaged item" })).value;
    assertions.assertSuccess(order.status === OrderStatus.Returned, "Order must be Returned");

    const earlyRefundFailed = await lifecycle
      .refundOrder({ orderId: order.id, reason: "Too early" })
      .then(() => false)
      .catch(() => true);
    assertions.assertSuccess(earlyRefundFailed, "Refund without payment must fail");

    const payment = await payments.createPayment({
      orderId: order.id,
      amount: order.totals.total.amount,
      currency: order.totals.total.currency,
      method: "cash",
    });
    await payments.updatePaymentStatus({ paymentId: payment.id, status: PaymentStatus.Succeeded });

    order = (await lifecycle.refundOrder({ orderId: order.id, reason: "Customer refund" })).value;
    assertions.assertSuccess(order.status === OrderStatus.Refunded, "Order must be Refunded");

    const timeline = (await lifecycle.getTimeline(order.id)).value;
    assertions.assertSuccess(timeline.entries.length >= 5, "Timeline must contain status history");
  }
}

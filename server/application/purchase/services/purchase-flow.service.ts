import type { NotificationModule } from "@server/application/modules/notification/notification/api/notification.module";
import {
  NotificationChannel,
  NotificationRecipientType,
  createNotificationRecipient,
  type Notification,
} from "@server/application/modules/notification/notification/models";
import type { OrderFulfillmentModule } from "@server/application/modules/order-fulfillment/order-fulfillment/api/order-fulfillment.module";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { FulfillmentResult } from "@server/application/modules/order-fulfillment/order-fulfillment/models";
import type {
  CompletePurchaseResult,
  NotifyOrderInput,
  PayOrderResult,
} from "@server/application/purchase/dto";
import { toNotifyOrderInput } from "@server/application/purchase/dto";
import {
  NotifyCourierUseCase,
  NotifyWarehouseUseCase,
  PayOrderUseCase,
  PurchaseCreateOrderUseCase,
} from "@server/application/purchase/use-cases";
import { resolveAdminChatId } from "@server/application/purchase/services/purchase-notification-targets";
import { isSuccessfulPaymentStatus } from "@server/application/modules/payment/payment/models";

export interface PostPaymentFlowResult {
  readonly fulfillment: FulfillmentResult | null;
  readonly warehouseNotification: Notification | null;
  readonly courierNotification: Notification | null;
  readonly adminNotification: Notification | null;
}

/** Orchestrates payment confirmation, fulfillment, and role-based notifications. */
export class PurchaseFlowService {
  constructor(
    private readonly createOrder: PurchaseCreateOrderUseCase,
    private readonly payOrder: PayOrderUseCase,
    private readonly notifyWarehouse: NotifyWarehouseUseCase,
    private readonly notifyCourier: NotifyCourierUseCase,
    private readonly fulfillment: OrderFulfillmentModule,
    private readonly orders: OrderModule,
    private readonly notifications: NotificationModule,
  ) {}

  async completePurchase(input: {
    sessionId: string;
    confirmCash?: boolean;
  }): Promise<CompletePurchaseResult> {
    const checkoutResult = (await this.createOrder.execute({ sessionId: input.sessionId })).value;
    const paymentResult = (
      await this.payOrder.execute({
        paymentId: checkoutResult.payment.paymentId,
        confirmCash: input.confirmCash ?? true,
      })
    ).value;

    const postPayment = await this.runPostPaymentFlow(checkoutResult.order.id, paymentResult);

    return Object.freeze({
      checkout: checkoutResult,
      payment: paymentResult,
      ...postPayment,
    });
  }

  async runPostPaymentFlow(
    orderId: string,
    paymentResult: PayOrderResult,
  ): Promise<PostPaymentFlowResult> {
    if (paymentResult.requiresOnlinePayment) {
      return Object.freeze({
        fulfillment: null,
        warehouseNotification: null,
        courierNotification: null,
        adminNotification: null,
      });
    }

    if (!isSuccessfulPaymentStatus(paymentResult.payment.status)) {
      return Object.freeze({
        fulfillment: null,
        warehouseNotification: null,
        courierNotification: null,
        adminNotification: null,
      });
    }

    const fulfillment = await this.fulfillment.fulfillOrder({
      orderId,
      paymentId: paymentResult.payment.id,
    });

    const order = await this.orders.getOrder(orderId);
    if (!order) {
      throw new Error(`Order not found after fulfillment: ${orderId}`);
    }

    const notifyInput = toNotifyOrderInput(order);
    const warehouseNotification = (await this.notifyWarehouse.execute(notifyInput)).value;
    const courierNotification = (await this.notifyCourier.execute(notifyInput)).value;
    const adminNotification = await this.notifyAdmin(notifyInput);

    return Object.freeze({
      fulfillment,
      warehouseNotification,
      courierNotification,
      adminNotification,
    });
  }

  private async notifyAdmin(input: NotifyOrderInput): Promise<Notification | null> {
    const chatId = resolveAdminChatId();
    if (!chatId) {
      return null;
    }

    return this.notifications.send({
      channel: NotificationChannel.Telegram,
      recipient: createNotificationRecipient({
        type: NotificationRecipientType.Admin,
        id: "admin",
        address: chatId,
      }),
      body: [
        "<b>[АДМИН]</b> Новый заказ",
        `Заказ: #${input.orderNumber}`,
        `Клиент: ${input.customerId}`,
        `Сумма: ${input.totalAmount} ${input.currency}`,
        `Позиций: ${input.itemCount}`,
      ].join("\n"),
      metadata: Object.freeze({
        orderId: input.orderId,
        template: "admin.order_created",
      }),
    });
  }
}

import type { OrderDTO } from "@shared/contracts/order";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import { formatTelegramOrderMessage } from "@server/adapters/notifications/telegram-order-message";
import { logger } from "@shared/observability/logger";

/**
 * Order notifications through the existing product bot (Задача №264) — same
 * bot token, same Bot API adapter, and the same telegram_bot_admins
 * allow-list as its recipients. No separate subscription step: every admin
 * in that table has already opened a chat with the bot (that's how they use
 * it for products), which is exactly what Telegram requires before a bot may
 * message someone.
 */
export class TelegramNotificationAdapter implements INotificationProvider {
  constructor(
    private readonly admins: ITelegramBotRepository,
    private readonly telegramApi: ITelegramBotApi,
    private readonly orders: IOrderRepository,
  ) {}

  /**
   * Each admin is an independent send — one who blocked the bot / never
   * pressed Start (HTTP 403) must not stop the others from being notified,
   * and a failed notification is logged, never thrown: it's a side effect of
   * the order, not part of it.
   */
  async sendOrderUpdate(order: OrderDTO, message: string): Promise<void> {
    const [chatIds, orderWithDescriptions] = await Promise.all([
      this.admins.listAdminIds(),
      this.withProductDescriptions(order),
    ]);
    if (chatIds.length === 0) {
      logger.warn("notification:telegram no recipients", { orderId: order.id });
      return;
    }

    const text = formatTelegramOrderMessage(orderWithDescriptions, message);
    const results = await Promise.allSettled(
      chatIds.map((chatId) => this.telegramApi.sendMessage(chatId, text)),
    );

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error("notification:telegram send failed", {
          orderId: order.id,
          chatId: chatIds[index],
          error: result.reason,
        });
      }
    });
  }

  /**
   * The order.created payload comes from a buyer-facing read, which never
   * carries productDescription (IOrderRepository.getForAdmin's doc comment) —
   * descriptions are joined in from the admin read, matched by order line id.
   * Everything else stays from the event's own order (it already has the
   * payment status/URL checkout just prepared). If that extra read fails,
   * the notification still goes out, just without descriptions.
   */
  private async withProductDescriptions(order: OrderDTO): Promise<OrderDTO> {
    try {
      const adminOrder = await this.orders.getForAdmin(order.id);
      if (!adminOrder) return order;
      const descriptions = new Map(
        adminOrder.items.map((item) => [item.id, item.productDescription ?? null]),
      );
      return {
        ...order,
        items: order.items.map((item) => ({
          ...item,
          productDescription: descriptions.get(item.id) ?? item.productDescription ?? null,
        })),
      };
    } catch (error) {
      logger.warn("notification:telegram description lookup failed", { orderId: order.id, error });
      return order;
    }
  }

  /**
   * Recipients are the telegram_bot_admins allow-list, maintained manually
   * via SQL (20260911010000_telegram_product_bot.sql). Self-subscription is
   * deliberately unsupported: a row there also grants product-creation
   * rights in the bot, so it must never be written from a notification opt-in.
   */
  async subscribe(_request: NotificationSubscribeRequest): Promise<void> {
    throw new Error(
      "TelegramNotificationAdapter.subscribe is unsupported — recipients are managed via telegram_bot_admins",
    );
  }
}

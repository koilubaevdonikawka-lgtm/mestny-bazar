import type { OrderDTO } from "@shared/contracts/order";
import type {
  INotificationProvider,
  NotificationSubscribeRequest,
} from "@server/ports/notification.provider";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import { formatTelegramOrderMessages } from "@server/adapters/notifications/telegram-order-message";
import { logger } from "@shared/observability/logger";
import { withRetry } from "@shared/lib/with-retry";

/**
 * Per message part. Only fast transient failures are retried (5xx/429/network,
 * see TelegramBotApiAdapter) — a timeout is not, so a Telegram outage can't
 * stretch checkout (this runs inside the order.created publish) by minutes.
 */
const TELEGRAM_SEND_RETRY = { attempts: 3, delayMs: 500 };

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
   * the order, not part of it. A large order arrives as several messages
   * (formatTelegramOrderMessages), sent to each admin in order, first part —
   * the one with the customer's contacts and address — first.
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

    const parts = formatTelegramOrderMessages(orderWithDescriptions, message);
    await Promise.all(chatIds.map((chatId) => this.sendParts(order.id, chatId, parts)));
  }

  /**
   * Parts go strictly one after another so they arrive in order. A part that
   * still fails after retries is logged and the next parts are still sent —
   * except when it's the first one: without the contacts part the rest is
   * meaningless, and a first-part failure means this chat is unreachable
   * (blocked bot, Telegram down), so the remaining sends would only fail too.
   */
  private async sendParts(orderId: string, chatId: number, parts: string[]): Promise<void> {
    for (const [index, text] of parts.entries()) {
      try {
        await withRetry(() => this.telegramApi.sendMessage(chatId, text), TELEGRAM_SEND_RETRY);
      } catch (error) {
        logger.error("notification:telegram send failed", {
          orderId,
          chatId,
          part: index + 1,
          parts: parts.length,
          error,
        });
        if (index === 0) return;
      }
    }
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

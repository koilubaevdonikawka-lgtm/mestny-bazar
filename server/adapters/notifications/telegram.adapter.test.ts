import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TelegramNotificationAdapter } from "@server/adapters/notifications/telegram.adapter";
import {
  TELEGRAM_MESSAGE_MAX_LENGTH,
  formatTelegramOrderMessage,
} from "@server/adapters/notifications/telegram-order-message";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    userId: "user-1",
    orderNumber: 1042,
    status: "CREATED",
    paymentStatus: "unpaid",
    paymentMethod: "CASH",
    subtotal: 350,
    deliveryFee: 100,
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    discountAmount: 0,
    couponCode: null,
    total: 450,
    currency: "KGS",
    customerName: "Айбек",
    customerPhone: "996700000000",
    addressSnapshot: "ул. Киевская 1, кв. 5",
    deliveryLatitude: null,
    deliveryLongitude: null,
    notes: null,
    paymentUrl: null,
    items: [
      {
        id: "i1",
        productId: "p1",
        variantId: null,
        productName: "Яблоки",
        productImageUrl: null,
        quantity: 2,
        unitPrice: 100,
        lineTotal: 200,
      },
      {
        id: "i2",
        productId: "p2",
        variantId: null,
        productName: "Молоко",
        productImageUrl: null,
        quantity: 1,
        unitPrice: 150,
        lineTotal: 150,
      },
    ],
    createdAt: "2026-09-24T08:15:00.000Z",
    paidAt: null,
    assignedCourierId: null,
    ...overrides,
  };
}

describe("formatTelegramOrderMessage", () => {
  it("lists every item with quantity and unit price, totals, payment and address", () => {
    const text = formatTelegramOrderMessage(makeOrder(), "🛒 Новый заказ #1042");

    expect(text.startsWith("🛒 Новый заказ #1042\n")).toBe(true);
    expect(text).toContain("1. Яблоки — 2 × 100.00 KGS = 200.00 KGS");
    expect(text).toContain("2. Молоко — 1 × 150.00 KGS = 150.00 KGS");
    expect(text).toContain("Доставка: 100.00 KGS");
    expect(text).toContain("Итого: 450.00 KGS");
    expect(text).toContain("Оплата: Наличными при получении");
    expect(text).toContain("Адрес: ул. Киевская 1, кв. 5");
    expect(text).not.toContain("Скидка");
  });

  it("renders the order time in Bishkek time, not the Worker's UTC", () => {
    // 08:15 UTC == 14:15 in Asia/Bishkek (UTC+6).
    expect(formatTelegramOrderMessage(makeOrder(), "h")).toContain("14:15");
  });

  it("shows online payment with its payment status, and the discount when present", () => {
    const text = formatTelegramOrderMessage(
      makeOrder({
        paymentMethod: "ONLINE",
        paymentStatus: "paid",
        status: "PAID",
        discountAmount: 50,
        couponCode: "SALE10",
        total: 400,
      }),
      "h",
    );

    expect(text).toContain("Оплата: Онлайн (Оплачен)");
    expect(text).toContain("Скидка: −50.00 KGS (SALE10)");
    expect(text).toContain("Итого: 400.00 KGS");
  });

  it("never exceeds Telegram's message length limit", () => {
    const items = Array.from({ length: 200 }, (_, index) => ({
      ...makeOrder().items[0],
      id: `i${index}`,
      productName: `Очень длинное название товара номер ${index}`,
    }));
    const text = formatTelegramOrderMessage(makeOrder({ items }), "h");
    expect(text.length).toBeLessThanOrEqual(TELEGRAM_MESSAGE_MAX_LENGTH);
  });
});

describe("TelegramNotificationAdapter.sendOrderUpdate", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function makeAdapter(adminIds: number[], sendMessage: ITelegramBotApi["sendMessage"]) {
    const repo = {
      listAdminIds: vi.fn().mockResolvedValue(adminIds),
    } as unknown as ITelegramBotRepository;
    const api: ITelegramBotApi = { sendMessage, downloadFile: vi.fn() };
    return new TelegramNotificationAdapter(repo, api);
  }

  it("sends the formatted order message to every allow-listed admin", async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const order = makeOrder();

    await makeAdapter([111, 222], sendMessage).sendOrderUpdate(order, "🛒 Новый заказ #1042");

    const expected = formatTelegramOrderMessage(order, "🛒 Новый заказ #1042");
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenCalledWith(111, expected);
    expect(sendMessage).toHaveBeenCalledWith(222, expected);
  });

  it("still notifies the other admins, and does not throw, when one send fails", async () => {
    const sendMessage = vi.fn(async (chatId: number) => {
      if (chatId === 111) throw new Error("Telegram sendMessage failed: HTTP 403 bot was blocked");
    });

    await expect(
      makeAdapter([111, 222], sendMessage).sendOrderUpdate(makeOrder(), "h"),
    ).resolves.toBeUndefined();
    expect(sendMessage).toHaveBeenCalledWith(222, expect.any(String));
  });

  it("sends nothing when the allow-list is empty", async () => {
    const sendMessage = vi.fn();
    await makeAdapter([], sendMessage).sendOrderUpdate(makeOrder(), "h");
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("refuses self-subscription — recipients come only from telegram_bot_admins", async () => {
    await expect(
      makeAdapter([], vi.fn()).subscribe({ userId: "u", channel: "telegram", contact: "1" }),
    ).rejects.toThrow(/telegram_bot_admins/);
  });
});

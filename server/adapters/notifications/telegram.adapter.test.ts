import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TelegramNotificationAdapter } from "@server/adapters/notifications/telegram.adapter";
import {
  TELEGRAM_MESSAGE_MAX_LENGTH,
  formatTelegramOrderMessages,
} from "@server/adapters/notifications/telegram-order-message";
import type { ITelegramBotApi } from "@server/ports/telegram-bot-api.port";
import type { ITelegramBotRepository } from "@server/ports/telegram-bot.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { OrderDTO } from "@shared/contracts/order";
import { RetryableError } from "@shared/lib/with-retry";

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

const single = (order: OrderDTO, headline = "h") => {
  const parts = formatTelegramOrderMessages(order, headline);
  expect(parts).toHaveLength(1);
  return parts[0];
};

function manyItems(count: number, description: (index: number) => string | null = () => null) {
  const base = makeOrder().items[0];
  return Array.from({ length: count }, (_, index) => ({
    ...base,
    id: `i${index}`,
    productName: `Товар номер ${index + 1}`,
    productDescription: description(index),
  }));
}

describe("formatTelegramOrderMessages", () => {
  it("1 item: one message, contacts and address before the item list", () => {
    const text = single(makeOrder({ notes: "Позвонить за час" }), "🛒 Новый заказ #1042");
    const lines = text.split("\n");

    expect(lines.slice(0, 13)).toEqual([
      "🛒 Новый заказ #1042",
      lines[1], // date · status
      "Клиент: Айбек",
      "Телефон: 996700000000",
      "Адрес: ул. Киевская 1, кв. 5",
      "Комментарий: Позвонить за час",
      "Оплата: Наличными при получении",
      "Товары: 350.00 KGS",
      "Доставка: 100.00 KGS",
      "Итого: 450.00 KGS",
      "Позиций: 2",
      "",
      "Состав заказа:",
    ]);
    expect(lines[1]).toMatch(/14:15 · /);
    expect(text).toContain(
      "1. Яблоки — 2 × 100.00 KGS = 200.00 KGS\n2. Молоко — 1 × 150.00 KGS = 150.00 KGS",
    );
    expect(text).not.toContain("часть");
    expect(text).not.toContain("…");
  });

  it("renders the order time in Bishkek time, not the Worker's UTC", () => {
    // 08:15 UTC == 14:15 in Asia/Bishkek (UTC+6).
    expect(single(makeOrder())).toContain("14:15");
  });

  it("shows online payment with its payment status, and the discount when present", () => {
    const text = single(
      makeOrder({
        paymentMethod: "ONLINE",
        paymentStatus: "paid",
        status: "PAID",
        discountAmount: 50,
        couponCode: "SALE10",
        total: 400,
      }),
    );

    expect(text).toContain("Оплата: Онлайн (Оплачен)");
    expect(text).toContain("Скидка: −50.00 KGS (SALE10)\nИтого: 400.00 KGS");
  });

  it("prints a description under its item, flattened to one line, and nothing for a blank one", () => {
    const [apples, milk] = makeOrder().items;
    const text = single(
      makeOrder({
        items: [
          { ...apples, productDescription: "Сладкие\n\nкрасные  яблоки" },
          { ...milk, productDescription: "   " },
        ],
      }),
    );

    expect(text).toContain("= 200.00 KGS\n    Сладкие красные яблоки\n2. Молоко");
    expect(text.endsWith("2. Молоко — 1 × 150.00 KGS = 150.00 KGS")).toBe(true);
    expect(text).not.toMatch(/нет описания/i);
  });

  it("keeps a long description whole — no 200-character cut, no ellipsis", () => {
    const [apples] = makeOrder().items;
    const text = single(
      makeOrder({ items: [{ ...apples, productDescription: "а".repeat(1000) }] }),
    );
    expect(text).toContain("а".repeat(1000));
    expect(text).not.toContain("…");
  });

  it("200 items with long descriptions: several parts, all items, each part within the limit, contacts in part 1", () => {
    const order = makeOrder({
      items: manyItems(200, (index) => `Описание товара ${index + 1}: ${"слово ".repeat(40)}`),
    });
    const parts = formatTelegramOrderMessages(order, "🛒 Новый заказ #1042");

    expect(parts.length).toBeGreaterThan(1);
    parts.forEach((part, index) => {
      expect(part.length).toBeLessThanOrEqual(TELEGRAM_MESSAGE_MAX_LENGTH);
      expect(part.startsWith(`Заказ №1042 — часть ${index + 1}/${parts.length}\n`)).toBe(true);
      expect(part).not.toContain("…");
    });

    const first = parts[0];
    expect(first).toContain("Клиент: Айбек\nТелефон: 996700000000\nАдрес: ул. Киевская 1, кв. 5");
    expect(first).toContain("Позиций: 200");
    expect(first.indexOf("Адрес:")).toBeLessThan(first.indexOf("1. Товар номер 1 "));

    // Every item exactly once, in order, each with its own description in the same part.
    const all = parts.join("\n");
    for (let n = 1; n <= 200; n++) {
      const owner = parts.filter((part) => part.includes(`\n${n}. Товар номер ${n} — `));
      expect(owner).toHaveLength(1);
      expect(owner[0]).toContain(
        `${n}. Товар номер ${n} — 2 × 100.00 KGS = 200.00 KGS\n    Описание товара ${n}:`,
      );
    }
    const order1 = all.indexOf("\n1. Товар номер 1 ");
    const order200 = all.indexOf("\n200. Товар номер 200 ");
    expect(order1).toBeLessThan(order200);
    parts.slice(1).forEach((part) => expect(part).toContain("\nСостав заказа (продолжение):\n"));
  });

  it("69 items (the reported case) no longer lose the address", () => {
    const parts = formatTelegramOrderMessages(
      makeOrder({ items: manyItems(69, () => "Описание ".repeat(8)) }),
      "h",
    );
    expect(parts[0]).toContain("Адрес: ул. Киевская 1, кв. 5");
    expect(parts.join("\n")).toContain("\n69. Товар номер 69 — ");
  });

  it("special characters in names stay verbatim (plain text) and don't break the split", () => {
    const tricky = "Сыр *острый* _new_ [акция] <b>&amp;</b> `code` \\ 😀";
    const order = makeOrder({
      customerName: "Айбек <script>",
      notes: "Домофон *12*_",
      items: manyItems(150, () => `${tricky} ${"ё".repeat(30)}`).map((item, index) => ({
        ...item,
        productName: `${tricky} №${index + 1}`,
      })),
    });
    const parts = formatTelegramOrderMessages(order, "🛒 Новый заказ #1042");

    expect(parts.length).toBeGreaterThan(1);
    parts.forEach((part) => expect(part.length).toBeLessThanOrEqual(TELEGRAM_MESSAGE_MAX_LENGTH));
    expect(parts[0]).toContain("Клиент: Айбек <script>");
    expect(parts[0]).toContain("Комментарий: Домофон *12*_");
    const all = parts.join("\n");
    for (let n = 1; n <= 150; n++) expect(all).toContain(`${tricky} №${n} — `);
  });

  it("a single description longer than a whole message is carried over by words, never cut", () => {
    const [apples] = makeOrder().items;
    const words = Array.from({ length: 1500 }, (_, i) => `w${i}`).join(" ");
    const parts = formatTelegramOrderMessages(
      makeOrder({ items: [{ ...apples, productDescription: words }] }),
      "h",
    );

    expect(parts.length).toBeGreaterThan(1);
    parts.forEach((part) => expect(part.length).toBeLessThanOrEqual(TELEGRAM_MESSAGE_MAX_LENGTH));
    const joined = parts.join(" ").replace(/\s+/g, " ");
    expect(joined).toContain("w0 w1 w2");
    expect(joined).toContain("w1498 w1499");
  });
});

describe("TelegramNotificationAdapter.sendOrderUpdate", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function makeAdapter(
    adminIds: number[],
    sendMessage: ITelegramBotApi["sendMessage"],
    getForAdmin: IOrderRepository["getForAdmin"] = vi.fn().mockResolvedValue(null),
  ) {
    const repo = {
      listAdminIds: vi.fn().mockResolvedValue(adminIds),
    } as unknown as ITelegramBotRepository;
    const api: ITelegramBotApi = { sendMessage, downloadFile: vi.fn() };
    const orders = { getForAdmin } as unknown as IOrderRepository;
    return new TelegramNotificationAdapter(repo, api, orders);
  }

  it("joins product descriptions from the admin read into the sent message", async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const order = makeOrder({ paymentMethod: "ONLINE", paymentStatus: "awaiting" });
    const adminOrder = makeOrder({
      items: order.items.map((item) =>
        item.id === "i1" ? { ...item, productDescription: "Сладкие, урожай 2026" } : item,
      ),
    });

    await makeAdapter([111], sendMessage, vi.fn().mockResolvedValue(adminOrder)).sendOrderUpdate(
      order,
      "h",
    );

    const text = sendMessage.mock.calls[0][1] as string;
    expect(text).toContain(
      "1. Яблоки — 2 × 100.00 KGS = 200.00 KGS\n    Сладкие, урожай 2026\n2. Молоко",
    );
    // Payment state stays from the event's own order, not the re-read.
    expect(text).toContain("Оплата: Онлайн (Ожидает оплаты)");
  });

  it("still sends, without descriptions, when the description lookup fails", async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const order = makeOrder();

    await makeAdapter(
      [111],
      sendMessage,
      vi.fn().mockRejectedValue(new Error("db down")),
    ).sendOrderUpdate(order, "h");

    expect(sendMessage).toHaveBeenCalledWith(111, formatTelegramOrderMessages(order, "h")[0]);
  });

  it("sends the formatted order message to every allow-listed admin", async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const order = makeOrder();

    await makeAdapter([111, 222], sendMessage).sendOrderUpdate(order, "🛒 Новый заказ #1042");

    const [expected] = formatTelegramOrderMessages(order, "🛒 Новый заказ #1042");
    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenCalledWith(111, expected);
    expect(sendMessage).toHaveBeenCalledWith(222, expected);
  });

  it("sends every part of a large order to each admin, in order, contacts part first", async () => {
    const sent: Array<[number, string]> = [];
    const sendMessage = vi.fn(async (chatId: number, text: string) => {
      await new Promise((resolve) => setTimeout(resolve, chatId === 111 ? 2 : 0));
      sent.push([chatId, text]);
    });
    const order = makeOrder({ items: manyItems(200, () => "Описание ".repeat(30)) });
    const parts = formatTelegramOrderMessages(order, "h");

    await makeAdapter([111, 222], sendMessage).sendOrderUpdate(order, "h");

    expect(parts.length).toBeGreaterThan(1);
    for (const chatId of [111, 222]) {
      expect(sent.filter(([id]) => id === chatId).map(([, text]) => text)).toEqual(parts);
    }
    expect(parts[0]).toContain("Адрес:");
  });

  it("retries a part that hit a transient error, then carries on with the rest", async () => {
    vi.useFakeTimers();
    let failures = 1;
    const sendMessage = vi.fn(async (_chatId: number, text: string) => {
      if (text.includes("часть 2/") && failures-- > 0) {
        throw new RetryableError("Telegram sendMessage failed: HTTP 502");
      }
    });
    const order = makeOrder({ items: manyItems(200, () => "Описание ".repeat(30)) });
    const parts = formatTelegramOrderMessages(order, "h");

    const done = makeAdapter([111], sendMessage).sendOrderUpdate(order, "h");
    await vi.runAllTimersAsync();
    await done;

    expect(sendMessage).toHaveBeenCalledTimes(parts.length + 1);
    expect(sendMessage.mock.calls.map(([, text]) => text)).toEqual([
      parts[0],
      parts[1],
      ...parts.slice(1),
    ]);
  });

  it("logs a part that keeps failing, still sends the later parts", async () => {
    vi.useFakeTimers();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const sendMessage = vi.fn(async (_chatId: number, text: string) => {
      if (text.includes("часть 2/")) throw new RetryableError("HTTP 500");
    });
    const order = makeOrder({ items: manyItems(200, () => "Описание ".repeat(30)) });
    const parts = formatTelegramOrderMessages(order, "h");

    const done = makeAdapter([111], sendMessage).sendOrderUpdate(order, "h");
    await vi.runAllTimersAsync();
    await expect(done).resolves.toBeUndefined();

    const sentTexts = sendMessage.mock.calls.map(([, text]) => text);
    expect(sentTexts.filter((text) => text === parts[1])).toHaveLength(3); // 3 attempts
    expect(sentTexts.at(-1)).toBe(parts.at(-1));
    expect(errors).toHaveBeenCalled();
  });

  it("stops sending to a chat whose first (contacts) part can't be delivered", async () => {
    const sendMessage = vi.fn(async (chatId: number) => {
      if (chatId === 111) throw new Error("Telegram sendMessage failed: HTTP 403 bot was blocked");
    });
    const order = makeOrder({ items: manyItems(200, () => "Описание ".repeat(30)) });
    const parts = formatTelegramOrderMessages(order, "h");

    await expect(
      makeAdapter([111, 222], sendMessage).sendOrderUpdate(order, "h"),
    ).resolves.toBeUndefined();

    expect(sendMessage.mock.calls.filter(([chatId]) => chatId === 111)).toHaveLength(1);
    expect(sendMessage.mock.calls.filter(([chatId]) => chatId === 222)).toHaveLength(parts.length);
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

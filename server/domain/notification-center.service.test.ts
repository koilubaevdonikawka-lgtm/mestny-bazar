import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "@server/domain/notification-center.service";
import type { IOrderEventNotifier } from "@server/ports/order-events.port";
import type { INotificationProvider } from "@server/ports/notification.provider";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(): OrderDTO {
  return { id: "order-1" } as OrderDTO;
}

function fakeProvider(): INotificationProvider {
  return { sendOrderUpdate: vi.fn(), subscribe: vi.fn() };
}

describe("NotificationCenter.dispatch(order.created)", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still notifies warehouse and courier when notifying admin fails", async () => {
    const notifyWarehouse = vi.fn(async () => {});
    const notifyCourier = vi.fn(async () => {});
    const orderEvents: IOrderEventNotifier = {
      notifyAdmin: vi.fn(async () => {
        throw new Error("admin channel down");
      }),
      notifyWarehouse,
      notifyCourier,
    };
    const center = new NotificationCenter(orderEvents, fakeProvider());

    await expect(
      center.dispatch({ type: "order.created", order: makeOrder() }),
    ).resolves.toBeUndefined();

    expect(notifyWarehouse).toHaveBeenCalledTimes(1);
    expect(notifyCourier).toHaveBeenCalledTimes(1);
  });

  it("does not throw when every recipient fails", async () => {
    const orderEvents: IOrderEventNotifier = {
      notifyAdmin: vi.fn(async () => {
        throw new Error("down");
      }),
      notifyWarehouse: vi.fn(async () => {
        throw new Error("down");
      }),
      notifyCourier: vi.fn(async () => {
        throw new Error("down");
      }),
    };
    const center = new NotificationCenter(orderEvents, fakeProvider());

    await expect(
      center.dispatch({ type: "order.created", order: makeOrder() }),
    ).resolves.toBeUndefined();
  });

  it("throws a clear error for an unrecognized event type instead of silently no-op'ing", async () => {
    const orderEvents: IOrderEventNotifier = {
      notifyAdmin: vi.fn(async () => {}),
      notifyWarehouse: vi.fn(async () => {}),
      notifyCourier: vi.fn(async () => {}),
    };
    const center = new NotificationCenter(orderEvents, fakeProvider());

    await expect(center.dispatch({ type: "something.else" } as never)).rejects.toThrow(
      "Unknown notification event: something.else",
    );
  });
});

describe("NotificationCenter.subscribe", () => {
  it("delegates to the notification provider", async () => {
    const provider = fakeProvider();
    const center = new NotificationCenter(
      { notifyAdmin: vi.fn(), notifyWarehouse: vi.fn(), notifyCourier: vi.fn() },
      provider,
    );
    const request = { userId: "user-1", channel: "telegram" } as Parameters<
      typeof provider.subscribe
    >[0];

    await center.subscribe(request);

    expect(provider.subscribe).toHaveBeenCalledWith(request);
  });
});

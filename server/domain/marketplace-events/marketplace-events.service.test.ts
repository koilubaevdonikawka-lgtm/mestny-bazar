import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MarketplaceEventsService } from "@server/domain/marketplace-events/marketplace-events.service";
import type { MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";

function orderCreatedEvent(): MarketplaceEvent {
  return { type: "order.created", order: { id: "order-1" } as OrderDTO };
}

describe("MarketplaceEventsService", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves even when a subscriber throws — one failing handler must not fail publish()", async () => {
    const bus = new MarketplaceEventsService();
    const failing = vi.fn(async () => {
      throw new Error("notification adapter is down");
    });
    bus.subscribe("order.created", failing);

    await expect(bus.publish(orderCreatedEvent())).resolves.toBeUndefined();
    expect(failing).toHaveBeenCalledTimes(1);
  });

  it("still runs every other subscriber when one of them throws", async () => {
    const bus = new MarketplaceEventsService();
    const failing = vi.fn(async () => {
      throw new Error("boom");
    });
    const succeeding = vi.fn(async () => {});
    bus.subscribe("order.created", failing);
    bus.subscribe("order.created", succeeding);

    await bus.publish(orderCreatedEvent());

    expect(succeeding).toHaveBeenCalledTimes(1);
  });

  it("does nothing when no handler is subscribed to the event type", async () => {
    const bus = new MarketplaceEventsService();
    await expect(bus.publish(orderCreatedEvent())).resolves.toBeUndefined();
  });

  it("delivers the event to every subscriber of its type", async () => {
    const bus = new MarketplaceEventsService();
    const handlerA = vi.fn(async () => {});
    const handlerB = vi.fn(async () => {});
    bus.subscribe("order.created", handlerA);
    bus.subscribe("order.created", handlerB);

    const event = orderCreatedEvent();
    await bus.publish(event);

    expect(handlerA).toHaveBeenCalledWith(event);
    expect(handlerB).toHaveBeenCalledWith(event);
  });
});

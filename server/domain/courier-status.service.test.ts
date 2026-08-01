import { describe, expect, it, vi } from "vitest";
import { CourierStatusService } from "@server/domain/courier-status.service";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";

function fakeCourierStatusRepo(
  overrides: Partial<ICourierStatusRepository> = {},
): ICourierStatusRepository {
  return {
    listAvailable: vi.fn(async () => []),
    listAll: vi.fn(async () => []),
    get: vi.fn(async () => null),
    setAvailability: vi.fn(async (courierId: string, isAvailable: boolean) => ({
      courierId,
      isAvailable,
      lastSeenAt: "2026-08-01T00:00:00.000Z",
    })),
    touch: vi.fn(),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("CourierStatusService.setAvailability", () => {
  it("delegates to the repository and publishes courier.status_changed", async () => {
    const repo = fakeCourierStatusRepo();
    const events = fakeEventBus();
    const service = new CourierStatusService(repo, events);

    const result = await service.setAvailability("courier-1", false);

    expect(repo.setAvailability).toHaveBeenCalledWith("courier-1", false);
    expect(result.isAvailable).toBe(false);
    expect(events.publish).toHaveBeenCalledWith({
      type: "courier.status_changed",
      courierId: "courier-1",
      isAvailable: false,
    });
  });
});

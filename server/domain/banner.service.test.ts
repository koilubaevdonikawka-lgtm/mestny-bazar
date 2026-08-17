import { describe, expect, it, vi } from "vitest";
import { BannerService } from "@server/domain/banner.service";
import { BannerValidationError } from "@server/domain/banner.errors";
import type { IBannerRepository } from "@server/ports/banner.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { BannerDTO } from "@shared/contracts/banner";

function makeBanner(overrides: Partial<BannerDTO> = {}): BannerDTO {
  return {
    id: "banner-1",
    title: "Летняя акция",
    subtitle: null,
    imageUrl: null,
    linkUrl: null,
    sortOrder: 0,
    startsAt: null,
    endsAt: null,
    isActive: true,
    ...overrides,
  };
}

function fakeBannerRepository(overrides: Partial<IBannerRepository> = {}): IBannerRepository {
  return {
    listAll: vi.fn(async () => []),
    listActive: vi.fn(async () => []),
    create: vi.fn(async () => makeBanner()),
    update: vi.fn(async () => makeBanner()),
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

describe("BannerService.listActiveBanners", () => {
  it("excludes a banner whose display period has not started yet", async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const banners = fakeBannerRepository({
      listActive: vi.fn(async () => [makeBanner({ startsAt: future })]),
    });
    const service = new BannerService(banners, fakeEventBus());

    expect(await service.listActiveBanners()).toEqual([]);
  });

  it("excludes a banner whose display period has already ended", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const banners = fakeBannerRepository({
      listActive: vi.fn(async () => [makeBanner({ endsAt: past })]),
    });
    const service = new BannerService(banners, fakeEventBus());

    expect(await service.listActiveBanners()).toEqual([]);
  });

  it("includes a banner with no display period set, or one currently within it", async () => {
    const noPeriod = makeBanner({ id: "b1" });
    const withinPeriod = makeBanner({
      id: "b2",
      startsAt: new Date(Date.now() - 86_400_000).toISOString(),
      endsAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    const banners = fakeBannerRepository({
      listActive: vi.fn(async () => [noPeriod, withinPeriod]),
    });
    const service = new BannerService(banners, fakeEventBus());

    expect(await service.listActiveBanners()).toEqual([noPeriod, withinPeriod]);
  });
});

describe("BannerService.createBanner", () => {
  it("rejects a title shorter than 2 characters", async () => {
    const service = new BannerService(fakeBannerRepository(), fakeEventBus());

    await expect(service.createBanner({ title: "x" })).rejects.toThrow(BannerValidationError);
  });

  it("publishes content.published on success", async () => {
    const banner = makeBanner();
    const banners = fakeBannerRepository({ create: vi.fn(async () => banner) });
    const events = fakeEventBus();
    const service = new BannerService(banners, events);

    await service.createBanner({ title: "Летняя акция" });

    expect(events.publish).toHaveBeenCalledWith({ type: "content.published", banner });
  });
});

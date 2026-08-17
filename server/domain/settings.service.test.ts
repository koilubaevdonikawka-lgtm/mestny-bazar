import { describe, expect, it, vi } from "vitest";
import { SettingsService } from "@server/domain/settings.service";
import type { ISettingsRepository } from "@server/ports/settings.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { PlatformSettingDTO } from "@shared/contracts/settings";

function makeSetting(overrides: Partial<PlatformSettingDTO> = {}): PlatformSettingDTO {
  return {
    key: "store.name",
    value: "Местный Базар",
    category: "general",
    updatedBy: "admin-1",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<ISettingsRepository> = {}): ISettingsRepository {
  return {
    list: vi.fn(async () => []),
    get: vi.fn(async () => null),
    set: vi.fn(async () => makeSetting()),
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

describe("SettingsService.list", () => {
  it("delegates to the repository", async () => {
    const settings = [makeSetting(), makeSetting({ key: "store.phone" })];
    const repo = fakeRepo({ list: vi.fn(async () => settings) });
    const service = new SettingsService(repo, fakeEventBus());

    expect(await service.list()).toBe(settings);
  });
});

describe("SettingsService.get", () => {
  it("delegates to the repository and passes through null", async () => {
    const repo = fakeRepo({ get: vi.fn(async () => null) });
    const service = new SettingsService(repo, fakeEventBus());

    expect(await service.get("missing.key")).toBeNull();
    expect(repo.get).toHaveBeenCalledWith("missing.key");
  });

  it("returns the setting when found", async () => {
    const setting = makeSetting();
    const repo = fakeRepo({ get: vi.fn(async () => setting) });
    const service = new SettingsService(repo, fakeEventBus());

    expect(await service.get("store.name")).toBe(setting);
  });
});

describe("SettingsService.update", () => {
  it("passes the acting user as updatedBy to the repository's set()", async () => {
    const repo = fakeRepo();
    const service = new SettingsService(repo, fakeEventBus());

    await service.update("admin-1", {
      key: "store.name",
      value: "Местный Базар",
      category: "general",
    });

    expect(repo.set).toHaveBeenCalledWith("store.name", "Местный Базар", "general", "admin-1");
  });

  it("returns whatever the repository returns", async () => {
    const saved = makeSetting({ key: "store.phone", value: "+996700000000" });
    const repo = fakeRepo({ set: vi.fn(async () => saved) });
    const service = new SettingsService(repo, fakeEventBus());

    const result = await service.update("admin-1", {
      key: "store.phone",
      value: "+996700000000",
      category: "general",
    });

    expect(result).toBe(saved);
  });

  it("publishes settings.changed (logs.md — Этап 5)", async () => {
    const saved = makeSetting({ key: "store.phone", category: "general" });
    const repo = fakeRepo({ set: vi.fn(async () => saved) });
    const events = fakeEventBus();
    const service = new SettingsService(repo, events);

    await service.update("admin-1", {
      key: "store.phone",
      value: "+996700000000",
      category: "general",
    });

    expect(events.publish).toHaveBeenCalledWith({
      type: "settings.changed",
      key: "store.phone",
      category: "general",
      updatedBy: "admin-1",
    });
  });
});

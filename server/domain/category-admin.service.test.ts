import { describe, expect, it, vi } from "vitest";
import { CategoryAdminService } from "@server/domain/category-admin.service";
import {
  CategoryNotFoundError,
  CategoryValidationError,
} from "@server/domain/category-admin.errors";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";

function makeCategory(overrides: Partial<AdminCategoryDTO> = {}): AdminCategoryDTO {
  return {
    id: "cat-1",
    name: "Молочные продукты",
    slug: "molochnye-produkty",
    description: null,
    imageUrl: null,
    sortOrder: 0,
    isActive: true,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IAdminCategoryRepository> = {}): IAdminCategoryRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeCategory()),
    create: vi.fn(async () => makeCategory()),
    update: vi.fn(async () => makeCategory()),
    slugExists: vi.fn(async () => false),
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

describe("CategoryAdminService.listCategories", () => {
  it("delegates to the repository", async () => {
    const categories = [makeCategory(), makeCategory({ id: "cat-2" })];
    const repo = fakeRepo({ listAll: vi.fn(async () => categories) });
    const service = new CategoryAdminService(repo, fakeEventBus());

    expect(await service.listCategories()).toBe(categories);
  });
});

describe("CategoryAdminService.createCategory", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.createCategory({ name: "A" })).rejects.toBeInstanceOf(
      CategoryValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("slugifies the name when no slug is provided", async () => {
    const repo = fakeRepo();
    const service = new CategoryAdminService(repo, fakeEventBus());

    await service.createCategory({ name: "Молочные продукты" });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Молочные продукты", slug: expect.any(String) }),
    );
  });

  it("appends a numeric suffix when the slug already exists", async () => {
    const repo = fakeRepo({
      slugExists: vi.fn(async (slug: string) => slug === "dairy"),
    });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await service.createCategory({ name: "Dairy", slug: "dairy" });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: "dairy-2" }));
  });

  it("publishes category.created on success", async () => {
    const created = makeCategory();
    const repo = fakeRepo({ create: vi.fn(async () => created) });
    const events = fakeEventBus();
    const service = new CategoryAdminService(repo, events);

    await service.createCategory({ name: "Dairy" });
    expect(events.publish).toHaveBeenCalledWith({ type: "category.created", category: created });
  });
});

describe("CategoryAdminService.updateCategory", () => {
  it("throws CategoryNotFoundError when the category does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.updateCategory({ id: "missing", name: "X" })).rejects.toBeInstanceOf(
      CategoryNotFoundError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates a new name before delegating to the repository", async () => {
    const repo = fakeRepo();
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.updateCategory({ id: "cat-1", name: "A" })).rejects.toBeInstanceOf(
      CategoryValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("publishes category.updated on success", async () => {
    const updated = makeCategory({ isActive: false });
    const repo = fakeRepo({ update: vi.fn(async () => updated) });
    const events = fakeEventBus();
    const service = new CategoryAdminService(repo, events);

    await service.updateCategory({ id: "cat-1", isActive: false });
    expect(events.publish).toHaveBeenCalledWith({ type: "category.updated", category: updated });
  });
});

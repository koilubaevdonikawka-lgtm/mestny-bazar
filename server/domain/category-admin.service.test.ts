import { describe, expect, it, vi } from "vitest";
import { CategoryAdminService } from "@server/domain/category-admin.service";
import {
  CategoryHasChildrenError,
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
    nameKg: null,
    parentId: null,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IAdminCategoryRepository> = {}): IAdminCategoryRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeCategory()),
    create: vi.fn(async () => makeCategory()),
    update: vi.fn(async () => makeCategory()),
    delete: vi.fn(async () => {}),
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

  it("accepts an explicit null parentId (top-level) without checking for a parent", async () => {
    const repo = fakeRepo();
    const service = new CategoryAdminService(repo, fakeEventBus());

    await service.createCategory({ name: "Dairy", parentId: null });
    expect(repo.getById).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: null }));
  });

  it("rejects a parentId that does not resolve to an existing category", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(
      service.createCategory({ name: "Dairy", parentId: "missing-parent" }),
    ).rejects.toBeInstanceOf(CategoryValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("creates successfully with a valid existing parentId", async () => {
    const parent = makeCategory({ id: "parent-1" });
    const repo = fakeRepo({ getById: vi.fn(async () => parent) });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await service.createCategory({ name: "Dairy", parentId: "parent-1" });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: "parent-1" }));
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

  it("rejects a category being set as its own parent", async () => {
    const repo = fakeRepo();
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.updateCategory({ id: "cat-1", parentId: "cat-1" })).rejects.toBeInstanceOf(
      CategoryValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("rejects a parentId that does not resolve to an existing category", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async (id: string) => (id === "cat-1" ? makeCategory() : null)),
    });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(
      service.updateCategory({ id: "cat-1", parentId: "missing-parent" }),
    ).rejects.toBeInstanceOf(CategoryValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("re-activates a hidden category (isActive: true)", async () => {
    const reactivated = makeCategory({ isActive: true });
    const repo = fakeRepo({
      getById: vi.fn(async () => makeCategory({ isActive: false })),
      update: vi.fn(async () => reactivated),
    });
    const events = fakeEventBus();
    const service = new CategoryAdminService(repo, events);

    const result = await service.updateCategory({ id: "cat-1", isActive: true });

    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: "cat-1", isActive: true }),
    );
    expect(result.isActive).toBe(true);
    expect(events.publish).toHaveBeenCalledWith({
      type: "category.updated",
      category: reactivated,
    });
  });
});

describe("CategoryAdminService.deleteCategory", () => {
  it("throws CategoryNotFoundError when the category does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.deleteCategory("missing")).rejects.toBeInstanceOf(CategoryNotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("rejects deleting a category that still has subcategories", async () => {
    const parent = makeCategory({ id: "parent-1" });
    const child = makeCategory({ id: "child-1", parentId: "parent-1" });
    const repo = fakeRepo({
      getById: vi.fn(async (id: string) => (id === "parent-1" ? parent : null)),
      listAll: vi.fn(async () => [parent, child]),
    });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.deleteCategory("parent-1")).rejects.toBeInstanceOf(
      CategoryHasChildrenError,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes a category with no subcategories and publishes category.deleted", async () => {
    const category = makeCategory({ id: "cat-1", name: "Dairy" });
    const repo = fakeRepo({
      getById: vi.fn(async () => category),
      listAll: vi.fn(async () => [category]),
    });
    const events = fakeEventBus();
    const service = new CategoryAdminService(repo, events);

    await service.deleteCategory("cat-1");

    expect(repo.delete).toHaveBeenCalledWith("cat-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "category.deleted",
      categoryId: "cat-1",
      name: "Dairy",
    });
  });

  it("allows deleting a category that still has products referencing it (FK sets category_id to null, not blocked)", async () => {
    // No products repository is involved in CategoryAdminService at all —
    // this documents the deliberate design choice (see category-admin.service.ts
    // deleteCategory doc comment): only children are checked, products are
    // intentionally left to the database's own ON DELETE SET NULL behavior.
    const category = makeCategory({ id: "cat-1" });
    const repo = fakeRepo({
      getById: vi.fn(async () => category),
      listAll: vi.fn(async () => [category]),
    });
    const service = new CategoryAdminService(repo, fakeEventBus());

    await expect(service.deleteCategory("cat-1")).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith("cat-1");
  });
});

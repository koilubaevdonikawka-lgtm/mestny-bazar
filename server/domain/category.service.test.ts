import { describe, expect, it, vi } from "vitest";
import { CategoryService } from "@server/domain/category.service";
import type { ICategoryRepository } from "@server/ports/category.repository";
import type { CategoryDTO } from "@shared/contracts/catalog";

function fakeCategoryRepo(overrides: Partial<ICategoryRepository> = {}): ICategoryRepository {
  return {
    list: vi.fn(async () => []),
    getBySlug: vi.fn(async () => null),
    ...overrides,
  };
}

const CATEGORY: CategoryDTO = {
  id: "cat-1",
  name: "Мука и крупы",
  slug: "muka-krupy",
  description: null,
  imageUrl: null,
  sortOrder: 1,
  nameKg: null,
  parentId: null,
};

describe("CategoryService", () => {
  it("listCategories delegates to the repository", async () => {
    const categories = fakeCategoryRepo({ list: vi.fn(async () => [CATEGORY]) });
    const service = new CategoryService(categories);

    const result = await service.listCategories();

    expect(result).toEqual([CATEGORY]);
  });

  it("getCategoryBySlug delegates to the repository", async () => {
    const categories = fakeCategoryRepo({ getBySlug: vi.fn(async () => CATEGORY) });
    const service = new CategoryService(categories);

    const result = await service.getCategoryBySlug("muka-krupy");

    expect(categories.getBySlug).toHaveBeenCalledWith("muka-krupy");
    expect(result).toBe(CATEGORY);
  });

  it("getCategoryBySlug returns null for an unknown slug", async () => {
    const categories = fakeCategoryRepo();
    const service = new CategoryService(categories);

    const result = await service.getCategoryBySlug("nope");

    expect(result).toBeNull();
  });

  it("getCategoryTree nests children under their parent using the flat list()", async () => {
    const parent: CategoryDTO = { ...CATEGORY, id: "parent", parentId: null };
    const child: CategoryDTO = { ...CATEGORY, id: "child", slug: "child", parentId: "parent" };
    const categories = fakeCategoryRepo({ list: vi.fn(async () => [parent, child]) });
    const service = new CategoryService(categories);

    const tree = await service.getCategoryTree();

    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("parent");
    expect(tree[0].children.map((c) => c.id)).toEqual(["child"]);
  });

  it("getCategoryAncestry returns the root-first parent chain for a nested category", async () => {
    const parent: CategoryDTO = { ...CATEGORY, id: "parent", parentId: null };
    const child: CategoryDTO = { ...CATEGORY, id: "child", slug: "child", parentId: "parent" };
    const categories = fakeCategoryRepo({ list: vi.fn(async () => [parent, child]) });
    const service = new CategoryService(categories);

    const ancestry = await service.getCategoryAncestry("child");

    expect(ancestry.map((c) => c.id)).toEqual(["parent"]);
  });

  it("getCategoryAncestry returns an empty chain for an unknown slug", async () => {
    const categories = fakeCategoryRepo({ list: vi.fn(async () => [CATEGORY]) });
    const service = new CategoryService(categories);

    const ancestry = await service.getCategoryAncestry("does-not-exist");

    expect(ancestry).toEqual([]);
  });
});

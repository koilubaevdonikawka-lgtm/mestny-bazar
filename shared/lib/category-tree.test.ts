import { describe, expect, it } from "vitest";
import { buildCategoryTree, getCategoryAncestry } from "./category-tree";
import type { CategoryDTO } from "@shared/contracts/catalog";

function fakeCategory(overrides: Partial<CategoryDTO> & { id: string }): CategoryDTO {
  return {
    name: overrides.id,
    slug: overrides.id,
    description: null,
    imageUrl: null,
    sortOrder: 0,
    nameKg: null,
    parentId: null,
    ...overrides,
  };
}

describe("buildCategoryTree", () => {
  it("treats every category with no parent as a root", () => {
    const categories = [fakeCategory({ id: "a" }), fakeCategory({ id: "b" })];
    const tree = buildCategoryTree(categories);
    expect(tree.map((n) => n.id).sort()).toEqual(["a", "b"]);
    expect(tree.every((n) => n.children.length === 0)).toBe(true);
  });

  it("nests a child under its parent, and the child is not a root", () => {
    const categories = [
      fakeCategory({ id: "parent" }),
      fakeCategory({ id: "child", parentId: "parent" }),
    ];
    const tree = buildCategoryTree(categories);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("parent");
    expect(tree[0].children.map((c) => c.id)).toEqual(["child"]);
  });

  it("nests three levels deep", () => {
    const categories = [
      fakeCategory({ id: "grandparent" }),
      fakeCategory({ id: "parent", parentId: "grandparent" }),
      fakeCategory({ id: "child", parentId: "parent" }),
    ];
    const tree = buildCategoryTree(categories);
    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("parent");
    expect(tree[0].children[0].children[0].id).toBe("child");
  });

  it("a parentId pointing at an id absent from the list falls back to root, not a crash", () => {
    const categories = [fakeCategory({ id: "orphan", parentId: "does-not-exist" })];
    const tree = buildCategoryTree(categories);
    expect(tree.map((n) => n.id)).toEqual(["orphan"]);
  });

  it("breaks a two-node cycle instead of recursing infinitely", () => {
    const categories = [
      fakeCategory({ id: "a", parentId: "b" }),
      fakeCategory({ id: "b", parentId: "a" }),
    ];
    const tree = buildCategoryTree(categories);
    // Neither is safely nestable under the other — both surface as roots
    // rather than the function looping forever or losing a category.
    expect(tree.map((n) => n.id).sort()).toEqual(["a", "b"]);
  });
});

describe("getCategoryAncestry", () => {
  const grandparent = fakeCategory({ id: "grandparent" });
  const parent = fakeCategory({ id: "parent", parentId: "grandparent" });
  const child = fakeCategory({ id: "child", parentId: "parent" });
  const categories = [grandparent, parent, child];

  it("returns the full chain, root-first, excluding the category itself", () => {
    expect(getCategoryAncestry(categories, "child").map((c) => c.id)).toEqual([
      "grandparent",
      "parent",
    ]);
  });

  it("returns a single-element chain for a first-level child", () => {
    expect(getCategoryAncestry(categories, "parent").map((c) => c.id)).toEqual(["grandparent"]);
  });

  it("returns an empty chain for a top-level category", () => {
    expect(getCategoryAncestry(categories, "grandparent")).toEqual([]);
  });

  it("returns an empty chain for an unknown id", () => {
    expect(getCategoryAncestry(categories, "does-not-exist")).toEqual([]);
  });

  it("does not loop forever on a cyclic parent chain", () => {
    const cyclic = [
      fakeCategory({ id: "a", parentId: "b" }),
      fakeCategory({ id: "b", parentId: "a" }),
    ];
    expect(() => getCategoryAncestry(cyclic, "a")).not.toThrow();
  });
});

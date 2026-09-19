import { describe, expect, it } from "vitest";
import { findSortOrderConflict } from "./category-sort-order-conflict";

// Задача №242 — regression test for the real bug: editing a subcategory's
// sort order silently "didn't apply" because the only rejection signal was
// the server's raw/untranslated duplicate-sortOrder error, easy to miss.
// This is the client-side pre-check that now catches it before the save
// request — same sibling scoping as CategoryAdminService.assertSortOrderFree.
describe("findSortOrderConflict (Задача №242)", () => {
  const categories = [
    { id: "a", parentId: "parent-1", sortOrder: "1" },
    { id: "b", parentId: "parent-1", sortOrder: "2" },
    { id: "c", parentId: "parent-2", sortOrder: "2" },
  ];

  it("finds a sibling under the same parent already using that sortOrder", () => {
    const conflict = findSortOrderConflict(categories, "b", "parent-1", "1");
    expect(conflict?.id).toBe("a");
  });

  it("does not treat a category under a DIFFERENT parent as a conflict, even with the same sortOrder", () => {
    const conflict = findSortOrderConflict(categories, "b", "parent-1", "2");
    expect(conflict).toBeUndefined();
  });

  it("excludes the category being edited itself", () => {
    const conflict = findSortOrderConflict(categories, "a", "parent-1", "1");
    expect(conflict).toBeUndefined();
  });

  it("returns undefined when no sibling uses that sortOrder", () => {
    const conflict = findSortOrderConflict(categories, "a", "parent-1", "99");
    expect(conflict).toBeUndefined();
  });
});

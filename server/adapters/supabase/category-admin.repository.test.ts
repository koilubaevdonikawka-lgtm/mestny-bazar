import { describe, expect, it } from "vitest";
import { mapAdminCategoryRow } from "@server/adapters/supabase/category-admin.repository";

describe("mapAdminCategoryRow", () => {
  it("maps an active category row, including is_active unlike the customer-facing mapper", () => {
    expect(
      mapAdminCategoryRow({
        id: "cat-1",
        name: "Молочные продукты",
        slug: "dairy",
        description: "Молоко, сыр, йогурт",
        image_url: "https://example.com/dairy.jpg",
        sort_order: 1,
        is_active: true,
        name_kg: "Сүт азыктар",
        parent_id: null,
      }),
    ).toEqual({
      id: "cat-1",
      name: "Молочные продукты",
      slug: "dairy",
      description: "Молоко, сыр, йогурт",
      imageUrl: "https://example.com/dairy.jpg",
      sortOrder: 1,
      isActive: true,
      nameKg: "Сүт азыктар",
      parentId: null,
    });
  });

  it("maps an inactive category row", () => {
    const mapped = mapAdminCategoryRow({
      id: "cat-2",
      name: "Скрытая категория",
      slug: "hidden",
      description: null,
      image_url: null,
      sort_order: 0,
      is_active: false,
      name_kg: null,
      parent_id: null,
    });

    expect(mapped.isActive).toBe(false);
  });
});

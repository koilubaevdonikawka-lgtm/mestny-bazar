import { describe, expect, it } from "vitest";
import {
  mapAttributeGroupRow,
  mapAttributeRow,
  mapAttributeValueRow,
  mapCategoryAttributeRow,
} from "@server/adapters/supabase/attribute.repository";

describe("mapAttributeGroupRow", () => {
  it("maps a group row", () => {
    expect(
      mapAttributeGroupRow({
        id: "group-1",
        name: "Пищевая ценность",
        slug: "nutrition",
        sort_order: 1,
        is_active: true,
      }),
    ).toEqual({
      id: "group-1",
      name: "Пищевая ценность",
      slug: "nutrition",
      sortOrder: 1,
      isActive: true,
    });
  });
});

describe("mapAttributeRow", () => {
  it("maps a NUMBER attribute with a unit", () => {
    expect(
      mapAttributeRow({
        id: "attr-1",
        group_id: "group-1",
        name: "Вес",
        slug: "weight",
        value_type: "NUMBER",
        unit: "кг",
        sort_order: 0,
        is_active: true,
        is_filterable: true,
      }),
    ).toEqual({
      id: "attr-1",
      groupId: "group-1",
      name: "Вес",
      slug: "weight",
      valueType: "NUMBER",
      unit: "кг",
      sortOrder: 0,
      isActive: true,
      isFilterable: true,
    });
  });

  it("maps an ungrouped TEXT attribute with no unit", () => {
    const mapped = mapAttributeRow({
      id: "attr-2",
      group_id: null,
      name: "Материал",
      slug: "material",
      value_type: "TEXT",
      unit: null,
      sort_order: 0,
      is_active: true,
      is_filterable: false,
    });
    expect(mapped.groupId).toBeNull();
    expect(mapped.unit).toBeNull();
    expect(mapped.isFilterable).toBe(false);
  });
});

describe("mapAttributeValueRow", () => {
  it("maps a LIST value option", () => {
    expect(
      mapAttributeValueRow({
        id: "val-1",
        attribute_id: "attr-3",
        value: "Красный",
        sort_order: 0,
      }),
    ).toEqual({ id: "val-1", attributeId: "attr-3", value: "Красный", sortOrder: 0 });
  });
});

describe("mapCategoryAttributeRow", () => {
  it("maps a category-attribute link", () => {
    expect(
      mapCategoryAttributeRow({
        category_id: "cat-1",
        attribute_id: "attr-1",
        is_required: true,
        sort_order: 2,
      }),
    ).toEqual({ categoryId: "cat-1", attributeId: "attr-1", isRequired: true, sortOrder: 2 });
  });
});

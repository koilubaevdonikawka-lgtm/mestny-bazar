import { describe, expect, it, vi } from "vitest";
import { AttributeAdminService } from "@server/domain/attribute-admin.service";
import {
  AttributeGroupNotFoundError,
  AttributeNotFoundError,
  AttributeValidationError,
} from "@server/domain/attribute.errors";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import type {
  AttributeDTO,
  AttributeGroupDTO,
  AttributeValueOptionDTO,
  CategoryAttributeLinkDTO,
} from "@shared/contracts/product-attributes";
import type { AdminCategoryDTO } from "@shared/contracts/category-admin";

function makeGroup(overrides: Partial<AttributeGroupDTO> = {}): AttributeGroupDTO {
  return {
    id: "group-1",
    name: "Пищевая ценность",
    slug: "nutrition",
    sortOrder: 0,
    isActive: true,
    ...overrides,
  };
}

function makeAttribute(overrides: Partial<AttributeDTO> = {}): AttributeDTO {
  return {
    id: "attr-1",
    groupId: null,
    name: "Вес",
    slug: "weight",
    valueType: "NUMBER",
    unit: "кг",
    sortOrder: 0,
    isActive: true,
    isFilterable: true,
    ...overrides,
  };
}

function makeCategory(overrides: Partial<AdminCategoryDTO> = {}): AdminCategoryDTO {
  return {
    id: "cat-1",
    name: "Молочные продукты",
    slug: "dairy",
    description: null,
    imageUrl: null,
    sortOrder: 0,
    isActive: true,
    nameKg: null,
    parentId: null,
    ...overrides,
  };
}

function fakeAttributeRepo(overrides: Partial<IAttributeRepository> = {}): IAttributeRepository {
  return {
    listGroups: vi.fn(async () => []),
    getGroupById: vi.fn(async () => makeGroup()),
    createGroup: vi.fn(async () => makeGroup()),
    updateGroup: vi.fn(async () => makeGroup()),
    groupSlugExists: vi.fn(async () => false),
    listAttributes: vi.fn(async () => []),
    getAttributeById: vi.fn(async () => makeAttribute()),
    createAttribute: vi.fn(async () => makeAttribute()),
    updateAttribute: vi.fn(async () => makeAttribute()),
    attributeSlugExists: vi.fn(async () => false),
    listValueOptions: vi.fn(async () => []),
    createValueOption: vi.fn(
      async () =>
        ({
          id: "val-1",
          attributeId: "attr-1",
          value: "Красный",
          sortOrder: 0,
        }) as AttributeValueOptionDTO,
    ),
    listAttributesForCategory: vi.fn(async () => []),
    linkAttributeToCategory: vi.fn(
      async () =>
        ({
          categoryId: "cat-1",
          attributeId: "attr-1",
          isRequired: false,
          sortOrder: 0,
        }) as CategoryAttributeLinkDTO,
    ),
    unlinkAttributeFromCategory: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeAdminCategoryRepo(
  overrides: Partial<IAdminCategoryRepository> = {},
): IAdminCategoryRepository {
  return {
    listAll: vi.fn(async () => []),
    getById: vi.fn(async () => makeCategory()),
    create: vi.fn(async () => makeCategory()),
    update: vi.fn(async () => makeCategory()),
    slugExists: vi.fn(async () => false),
    ...overrides,
  };
}

describe("AttributeAdminService.createGroup", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const attributes = fakeAttributeRepo();
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(service.createGroup({ name: "A" })).rejects.toBeInstanceOf(
      AttributeValidationError,
    );
    expect(attributes.createGroup).not.toHaveBeenCalled();
  });

  it("appends a numeric suffix when the slug already exists", async () => {
    const attributes = fakeAttributeRepo({
      groupSlugExists: vi.fn(async (slug: string) => slug === "nutrition"),
    });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await service.createGroup({ name: "Nutrition", slug: "nutrition" });
    expect(attributes.createGroup).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "nutrition-2" }),
    );
  });
});

describe("AttributeAdminService.updateGroup", () => {
  it("throws AttributeGroupNotFoundError when the group does not exist", async () => {
    const attributes = fakeAttributeRepo({ getGroupById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(service.updateGroup({ id: "missing", name: "X" })).rejects.toBeInstanceOf(
      AttributeGroupNotFoundError,
    );
    expect(attributes.updateGroup).not.toHaveBeenCalled();
  });
});

describe("AttributeAdminService.createAttribute", () => {
  it("rejects an unknown groupId", async () => {
    const attributes = fakeAttributeRepo({ getGroupById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(
      service.createAttribute({ name: "Вес", valueType: "NUMBER", groupId: "missing" }),
    ).rejects.toBeInstanceOf(AttributeValidationError);
    expect(attributes.createAttribute).not.toHaveBeenCalled();
  });

  it("creates successfully with a valid groupId and slugifies the name", async () => {
    const attributes = fakeAttributeRepo();
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await service.createAttribute({ name: "Вес", valueType: "NUMBER", groupId: "group-1" });
    expect(attributes.createAttribute).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Вес", valueType: "NUMBER", slug: expect.any(String) }),
    );
  });
});

describe("AttributeAdminService.updateAttribute", () => {
  it("throws AttributeNotFoundError when the attribute does not exist", async () => {
    const attributes = fakeAttributeRepo({ getAttributeById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(service.updateAttribute({ id: "missing", unit: "кг" })).rejects.toBeInstanceOf(
      AttributeNotFoundError,
    );
    expect(attributes.updateAttribute).not.toHaveBeenCalled();
  });
});

describe("AttributeAdminService.createValueOption", () => {
  it("rejects adding an option to a non-LIST attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "NUMBER" })),
    });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(
      service.createValueOption({ attributeId: "attr-1", value: "Красный" }),
    ).rejects.toBeInstanceOf(AttributeValidationError);
    expect(attributes.createValueOption).not.toHaveBeenCalled();
  });

  it("rejects an unknown attributeId", async () => {
    const attributes = fakeAttributeRepo({ getAttributeById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(
      service.createValueOption({ attributeId: "missing", value: "Красный" }),
    ).rejects.toBeInstanceOf(AttributeNotFoundError);
  });

  it("accepts a value option for a LIST attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
    });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await service.createValueOption({ attributeId: "attr-1", value: "Красный" });
    expect(attributes.createValueOption).toHaveBeenCalledWith({
      attributeId: "attr-1",
      value: "Красный",
    });
  });
});

describe("AttributeAdminService.linkAttributeToCategory", () => {
  it("rejects an unknown categoryId", async () => {
    const attributes = fakeAttributeRepo();
    const categories = fakeAdminCategoryRepo({ getById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, categories);

    await expect(
      service.linkAttributeToCategory({ categoryId: "missing", attributeId: "attr-1" }),
    ).rejects.toBeInstanceOf(AttributeValidationError);
    expect(attributes.linkAttributeToCategory).not.toHaveBeenCalled();
  });

  it("rejects an unknown attributeId", async () => {
    const attributes = fakeAttributeRepo({ getAttributeById: vi.fn(async () => null) });
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await expect(
      service.linkAttributeToCategory({ categoryId: "cat-1", attributeId: "missing" }),
    ).rejects.toBeInstanceOf(AttributeNotFoundError);
    expect(attributes.linkAttributeToCategory).not.toHaveBeenCalled();
  });

  it("links successfully when both category and attribute exist", async () => {
    const attributes = fakeAttributeRepo();
    const service = new AttributeAdminService(attributes, fakeAdminCategoryRepo());

    await service.linkAttributeToCategory({ categoryId: "cat-1", attributeId: "attr-1" });
    expect(attributes.linkAttributeToCategory).toHaveBeenCalledWith({
      categoryId: "cat-1",
      attributeId: "attr-1",
    });
  });
});

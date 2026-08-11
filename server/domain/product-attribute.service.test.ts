import { describe, expect, it, vi } from "vitest";
import { ProductAttributeService } from "@server/domain/product-attribute.service";
import {
  AttributeNotFoundError,
  AttributeValueTypeMismatchError,
} from "@server/domain/attribute.errors";
import type { IProductAttributeRepository } from "@server/ports/product-attribute.repository";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import type { AttributeDTO, ProductAttributeValueDTO } from "@shared/contracts/product-attributes";

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

function makeProductAttributeValue(
  overrides: Partial<ProductAttributeValueDTO> = {},
): ProductAttributeValueDTO {
  return {
    id: "pav-1",
    productId: "prod-1",
    attributeId: "attr-1",
    valueText: null,
    valueNumber: null,
    valueBoolean: null,
    attributeValueId: null,
    ...overrides,
  };
}

function fakeProductAttributeRepo(
  overrides: Partial<IProductAttributeRepository> = {},
): IProductAttributeRepository {
  return {
    listForProduct: vi.fn(async () => []),
    setValue: vi.fn(async () => makeProductAttributeValue()),
    removeValue: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeAttributeRepo(overrides: Partial<IAttributeRepository> = {}): IAttributeRepository {
  return {
    listGroups: vi.fn(async () => []),
    getGroupById: vi.fn(async () => null),
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
    groupSlugExists: vi.fn(async () => false),
    listAttributes: vi.fn(async () => []),
    getAttributeById: vi.fn(async () => makeAttribute()),
    createAttribute: vi.fn(),
    updateAttribute: vi.fn(),
    attributeSlugExists: vi.fn(async () => false),
    listValueOptions: vi.fn(async () => []),
    createValueOption: vi.fn(),
    listAttributesForCategory: vi.fn(async () => []),
    linkAttributeToCategory: vi.fn(),
    unlinkAttributeFromCategory: vi.fn(async () => {}),
    ...overrides,
  } as IAttributeRepository;
}

describe("ProductAttributeService.setValue", () => {
  it("throws AttributeNotFoundError for an unknown attributeId", async () => {
    const attributes = fakeAttributeRepo({ getAttributeById: vi.fn(async () => null) });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({ productId: "prod-1", attributeId: "missing", valueText: "x" }),
    ).rejects.toBeInstanceOf(AttributeNotFoundError);
  });

  it("accepts a TEXT value for a TEXT attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "TEXT" })),
    });
    const productAttributes = fakeProductAttributeRepo();
    const service = new ProductAttributeService(productAttributes, attributes);

    await service.setValue({ productId: "prod-1", attributeId: "attr-1", valueText: "Хлопок" });
    expect(productAttributes.setValue).toHaveBeenCalledWith({
      productId: "prod-1",
      attributeId: "attr-1",
      valueText: "Хлопок",
    });
  });

  it("rejects a missing valueText for a TEXT attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "TEXT" })),
    });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({ productId: "prod-1", attributeId: "attr-1", valueNumber: 5 }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("accepts a finite valueNumber for a NUMBER attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "NUMBER" })),
    });
    const productAttributes = fakeProductAttributeRepo();
    const service = new ProductAttributeService(productAttributes, attributes);

    await service.setValue({ productId: "prod-1", attributeId: "attr-1", valueNumber: 1.5 });
    expect(productAttributes.setValue).toHaveBeenCalledWith({
      productId: "prod-1",
      attributeId: "attr-1",
      valueNumber: 1.5,
    });
  });

  it("rejects a non-finite valueNumber for a NUMBER attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "NUMBER" })),
    });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({ productId: "prod-1", attributeId: "attr-1", valueNumber: Number.NaN }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("accepts a valueBoolean for a BOOLEAN attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "BOOLEAN" })),
    });
    const productAttributes = fakeProductAttributeRepo();
    const service = new ProductAttributeService(productAttributes, attributes);

    await service.setValue({ productId: "prod-1", attributeId: "attr-1", valueBoolean: false });
    expect(productAttributes.setValue).toHaveBeenCalledWith({
      productId: "prod-1",
      attributeId: "attr-1",
      valueBoolean: false,
    });
  });

  it("rejects a missing valueBoolean for a BOOLEAN attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "BOOLEAN" })),
    });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({ productId: "prod-1", attributeId: "attr-1" }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("accepts an attributeValueId that belongs to the LIST attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
      listValueOptions: vi.fn(async () => [
        { id: "val-red", attributeId: "attr-1", value: "Красный", sortOrder: 0 },
      ]),
    });
    const productAttributes = fakeProductAttributeRepo();
    const service = new ProductAttributeService(productAttributes, attributes);

    await service.setValue({
      productId: "prod-1",
      attributeId: "attr-1",
      attributeValueId: "val-red",
    });
    expect(productAttributes.setValue).toHaveBeenCalledWith({
      productId: "prod-1",
      attributeId: "attr-1",
      attributeValueId: "val-red",
    });
  });

  it("rejects an attributeValueId that does not belong to the LIST attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
      listValueOptions: vi.fn(async () => [
        { id: "val-red", attributeId: "attr-1", value: "Красный", sortOrder: 0 },
      ]),
    });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({
        productId: "prod-1",
        attributeId: "attr-1",
        attributeValueId: "val-other",
      }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("rejects a missing attributeValueId for a LIST attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
    });
    const service = new ProductAttributeService(fakeProductAttributeRepo(), attributes);

    await expect(
      service.setValue({ productId: "prod-1", attributeId: "attr-1" }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });
});

describe("ProductAttributeService.listForProduct / removeValue", () => {
  it("delegates listForProduct to the repository", async () => {
    const values = [makeProductAttributeValue()];
    const productAttributes = fakeProductAttributeRepo({
      listForProduct: vi.fn(async () => values),
    });
    const service = new ProductAttributeService(productAttributes, fakeAttributeRepo());

    expect(await service.listForProduct("prod-1")).toBe(values);
  });

  it("delegates removeValue to the repository", async () => {
    const productAttributes = fakeProductAttributeRepo();
    const service = new ProductAttributeService(productAttributes, fakeAttributeRepo());

    await service.removeValue("prod-1", "attr-1");
    expect(productAttributes.removeValue).toHaveBeenCalledWith("prod-1", "attr-1");
  });
});

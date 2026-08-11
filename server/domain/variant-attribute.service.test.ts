import { describe, expect, it, vi } from "vitest";
import { VariantAttributeService } from "@server/domain/variant-attribute.service";
import {
  AttributeNotFoundError,
  AttributeValueTypeMismatchError,
} from "@server/domain/attribute.errors";
import type { IVariantAttributeRepository } from "@server/ports/variant-attribute.repository";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import type { VariantAttributeValueDTO } from "@shared/contracts/product-variant";
import type { AttributeDTO } from "@shared/contracts/product-attributes";

function makeAttribute(overrides: Partial<AttributeDTO> = {}): AttributeDTO {
  return {
    id: "attr-1",
    groupId: null,
    name: "Цвет",
    slug: "color",
    valueType: "LIST",
    unit: null,
    sortOrder: 0,
    isActive: true,
    isFilterable: true,
    ...overrides,
  };
}

function makeVariantAttributeValue(
  overrides: Partial<VariantAttributeValueDTO> = {},
): VariantAttributeValueDTO {
  return {
    id: "vav-1",
    variantId: "var-1",
    attributeId: "attr-1",
    valueText: null,
    valueNumber: null,
    valueBoolean: null,
    attributeValueId: null,
    ...overrides,
  };
}

function fakeVariantAttributeRepo(
  overrides: Partial<IVariantAttributeRepository> = {},
): IVariantAttributeRepository {
  return {
    listForVariant: vi.fn(async () => []),
    setValue: vi.fn(async () => makeVariantAttributeValue()),
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

describe("VariantAttributeService.setValue", () => {
  it("throws AttributeNotFoundError for an unknown attributeId", async () => {
    const attributes = fakeAttributeRepo({ getAttributeById: vi.fn(async () => null) });
    const service = new VariantAttributeService(fakeVariantAttributeRepo(), attributes);

    await expect(
      service.setValue({ variantId: "var-1", attributeId: "missing", valueText: "x" }),
    ).rejects.toBeInstanceOf(AttributeNotFoundError);
  });

  it("accepts a LIST value that belongs to the attribute (e.g. Color=Red)", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
      listValueOptions: vi.fn(async () => [
        { id: "val-red", attributeId: "attr-1", value: "Красный", sortOrder: 0 },
      ]),
    });
    const variantAttributes = fakeVariantAttributeRepo();
    const service = new VariantAttributeService(variantAttributes, attributes);

    await service.setValue({
      variantId: "var-1",
      attributeId: "attr-1",
      attributeValueId: "val-red",
    });
    expect(variantAttributes.setValue).toHaveBeenCalledWith({
      variantId: "var-1",
      attributeId: "attr-1",
      attributeValueId: "val-red",
    });
  });

  it("rejects a LIST value that does not belong to the attribute", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "LIST" })),
      listValueOptions: vi.fn(async () => [
        { id: "val-red", attributeId: "attr-1", value: "Красный", sortOrder: 0 },
      ]),
    });
    const service = new VariantAttributeService(fakeVariantAttributeRepo(), attributes);

    await expect(
      service.setValue({
        variantId: "var-1",
        attributeId: "attr-1",
        attributeValueId: "val-other",
      }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("accepts a NUMBER value (e.g. Weight=1.5)", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () =>
        makeAttribute({ valueType: "NUMBER", name: "Вес", unit: "кг" }),
      ),
    });
    const variantAttributes = fakeVariantAttributeRepo();
    const service = new VariantAttributeService(variantAttributes, attributes);

    await service.setValue({ variantId: "var-1", attributeId: "attr-1", valueNumber: 1.5 });
    expect(variantAttributes.setValue).toHaveBeenCalledWith({
      variantId: "var-1",
      attributeId: "attr-1",
      valueNumber: 1.5,
    });
  });

  it("rejects a non-finite NUMBER value", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "NUMBER" })),
    });
    const service = new VariantAttributeService(fakeVariantAttributeRepo(), attributes);

    await expect(
      service.setValue({ variantId: "var-1", attributeId: "attr-1", valueNumber: Number.NaN }),
    ).rejects.toBeInstanceOf(AttributeValueTypeMismatchError);
  });

  it("accepts a TEXT value", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "TEXT", name: "Упаковка" })),
    });
    const variantAttributes = fakeVariantAttributeRepo();
    const service = new VariantAttributeService(variantAttributes, attributes);

    await service.setValue({ variantId: "var-1", attributeId: "attr-1", valueText: "Коробка" });
    expect(variantAttributes.setValue).toHaveBeenCalledWith({
      variantId: "var-1",
      attributeId: "attr-1",
      valueText: "Коробка",
    });
  });

  it("accepts a BOOLEAN value", async () => {
    const attributes = fakeAttributeRepo({
      getAttributeById: vi.fn(async () => makeAttribute({ valueType: "BOOLEAN" })),
    });
    const variantAttributes = fakeVariantAttributeRepo();
    const service = new VariantAttributeService(variantAttributes, attributes);

    await service.setValue({ variantId: "var-1", attributeId: "attr-1", valueBoolean: true });
    expect(variantAttributes.setValue).toHaveBeenCalledWith({
      variantId: "var-1",
      attributeId: "attr-1",
      valueBoolean: true,
    });
  });
});

describe("VariantAttributeService.listForVariant / removeValue", () => {
  it("delegates listForVariant to the repository", async () => {
    const values = [makeVariantAttributeValue()];
    const variantAttributes = fakeVariantAttributeRepo({
      listForVariant: vi.fn(async () => values),
    });
    const service = new VariantAttributeService(variantAttributes, fakeAttributeRepo());

    expect(await service.listForVariant("var-1")).toBe(values);
  });

  it("delegates removeValue to the repository", async () => {
    const variantAttributes = fakeVariantAttributeRepo();
    const service = new VariantAttributeService(variantAttributes, fakeAttributeRepo());

    await service.removeValue("var-1", "attr-1");
    expect(variantAttributes.removeValue).toHaveBeenCalledWith("var-1", "attr-1");
  });
});

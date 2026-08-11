import type {
  ProductAttributeValueDTO,
  SetProductAttributeValueRequest,
} from "@shared/contracts/product-attributes";
import type { IProductAttributeRepository } from "@server/ports/product-attribute.repository";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import {
  AttributeNotFoundError,
  AttributeValueTypeMismatchError,
} from "@server/domain/attribute.errors";

/**
 * Assigns/reads a product's attribute values. Kept separate from
 * AttributeAdminService (which owns attribute *definitions*) since this
 * operates on the product aggregate and will be the seam future
 * display/filtering/variant stages read from — validation here (matching
 * the payload shape to the attribute's declared valueType) is what lets
 * those stages trust a product_attribute_values row without re-checking it.
 * Not wired into any existing product-write flow this stage (item 5).
 */
export class ProductAttributeService {
  constructor(
    private readonly productAttributes: IProductAttributeRepository,
    private readonly attributes: IAttributeRepository,
  ) {}

  async listForProduct(productId: string): Promise<ProductAttributeValueDTO[]> {
    return this.productAttributes.listForProduct(productId);
  }

  async setValue(data: SetProductAttributeValueRequest): Promise<ProductAttributeValueDTO> {
    const attribute = await this.attributes.getAttributeById(data.attributeId);
    if (!attribute) throw new AttributeNotFoundError();

    switch (attribute.valueType) {
      case "TEXT":
        if (!data.valueText?.trim()) {
          throw new AttributeValueTypeMismatchError("A TEXT attribute requires valueText");
        }
        return this.productAttributes.setValue({
          productId: data.productId,
          attributeId: data.attributeId,
          valueText: data.valueText,
        });

      case "NUMBER":
        if (
          data.valueNumber === undefined ||
          data.valueNumber === null ||
          !Number.isFinite(data.valueNumber)
        ) {
          throw new AttributeValueTypeMismatchError(
            "A NUMBER attribute requires a finite valueNumber",
          );
        }
        return this.productAttributes.setValue({
          productId: data.productId,
          attributeId: data.attributeId,
          valueNumber: data.valueNumber,
        });

      case "BOOLEAN":
        if (typeof data.valueBoolean !== "boolean") {
          throw new AttributeValueTypeMismatchError("A BOOLEAN attribute requires valueBoolean");
        }
        return this.productAttributes.setValue({
          productId: data.productId,
          attributeId: data.attributeId,
          valueBoolean: data.valueBoolean,
        });

      case "LIST": {
        if (!data.attributeValueId) {
          throw new AttributeValueTypeMismatchError("A LIST attribute requires attributeValueId");
        }
        const options = await this.attributes.listValueOptions(data.attributeId);
        if (!options.some((option) => option.id === data.attributeValueId)) {
          throw new AttributeValueTypeMismatchError(
            "attributeValueId does not belong to this attribute",
          );
        }
        return this.productAttributes.setValue({
          productId: data.productId,
          attributeId: data.attributeId,
          attributeValueId: data.attributeValueId,
        });
      }
    }
  }

  async removeValue(productId: string, attributeId: string): Promise<void> {
    return this.productAttributes.removeValue(productId, attributeId);
  }
}

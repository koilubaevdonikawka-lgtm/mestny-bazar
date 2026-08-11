import type {
  SetVariantAttributeValueRequest,
  VariantAttributeValueDTO,
} from "@shared/contracts/product-variant";
import type { IVariantAttributeRepository } from "@server/ports/variant-attribute.repository";
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import {
  AttributeNotFoundError,
  AttributeValueTypeMismatchError,
} from "@server/domain/attribute.errors";

/**
 * Assigns/reads a variant's attribute values — the sibling of
 * ProductAttributeService (Stage 12), reusing its exact error types since
 * the failure modes are identical, just scoped to a variant instead of a
 * product. Kept as a separate service (rather than extending
 * ProductAttributeService) so Stage 12's service is not touched.
 */
export class VariantAttributeService {
  constructor(
    private readonly variantAttributes: IVariantAttributeRepository,
    private readonly attributes: IAttributeRepository,
  ) {}

  async listForVariant(variantId: string): Promise<VariantAttributeValueDTO[]> {
    return this.variantAttributes.listForVariant(variantId);
  }

  async setValue(data: SetVariantAttributeValueRequest): Promise<VariantAttributeValueDTO> {
    const attribute = await this.attributes.getAttributeById(data.attributeId);
    if (!attribute) throw new AttributeNotFoundError();

    switch (attribute.valueType) {
      case "TEXT":
        if (!data.valueText?.trim()) {
          throw new AttributeValueTypeMismatchError("A TEXT attribute requires valueText");
        }
        return this.variantAttributes.setValue({
          variantId: data.variantId,
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
        return this.variantAttributes.setValue({
          variantId: data.variantId,
          attributeId: data.attributeId,
          valueNumber: data.valueNumber,
        });

      case "BOOLEAN":
        if (typeof data.valueBoolean !== "boolean") {
          throw new AttributeValueTypeMismatchError("A BOOLEAN attribute requires valueBoolean");
        }
        return this.variantAttributes.setValue({
          variantId: data.variantId,
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
        return this.variantAttributes.setValue({
          variantId: data.variantId,
          attributeId: data.attributeId,
          attributeValueId: data.attributeValueId,
        });
      }
    }
  }

  async removeValue(variantId: string, attributeId: string): Promise<void> {
    return this.variantAttributes.removeValue(variantId, attributeId);
  }
}

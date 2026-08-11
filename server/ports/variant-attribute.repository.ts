import type {
  SetVariantAttributeValueRequest,
  VariantAttributeValueDTO,
} from "@shared/contracts/product-variant";

/** A variant's actual attribute value assignments — the sibling of IProductAttributeRepository (Stage 12), scoped to variantId instead of productId. Deliberately a separate port so Stage 12's port/repository/service stay untouched. */
export interface IVariantAttributeRepository {
  listForVariant(variantId: string): Promise<VariantAttributeValueDTO[]>;
  /** Upsert — one row per (variantId, attributeId), enforced by a DB unique constraint. */
  setValue(data: SetVariantAttributeValueRequest): Promise<VariantAttributeValueDTO>;
  removeValue(variantId: string, attributeId: string): Promise<void>;
}

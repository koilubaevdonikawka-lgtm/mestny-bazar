/**
 * Product characteristics architecture (Stage 12). Groups + attributes +
 * (for LIST attributes) predefined value options are reference data;
 * CategoryAttributeLinkDTO/ProductAttributeValueDTO are the two link shapes
 * that attach that reference data to the existing category/product tables.
 * No UI or filtering/variant logic consumes these yet — this stage is
 * architecture only.
 */

export const AttributeValueType = {
  TEXT: "TEXT",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  LIST: "LIST",
} as const;

export type AttributeValueType = (typeof AttributeValueType)[keyof typeof AttributeValueType];

export interface AttributeGroupDTO {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateAttributeGroupRequest {
  name: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateAttributeGroupRequest {
  id: string;
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AttributeDTO {
  id: string;
  groupId: string | null;
  name: string;
  slug: string;
  valueType: AttributeValueType;
  /** Единица измерения (кг, л, см, ...) — display-only, mainly for NUMBER attributes. */
  unit: string | null;
  sortOrder: number;
  isActive: boolean;
  /** Reserved for the future filtering stage — not read by anything yet. */
  isFilterable: boolean;
}

export interface CreateAttributeRequest {
  groupId?: string | null;
  name: string;
  slug?: string;
  valueType: AttributeValueType;
  unit?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  isFilterable?: boolean;
}

/**
 * valueType is deliberately not updatable here: changing it after values
 * already exist would orphan product_attribute_values/attribute_values
 * typed for the old type. Delete + recreate is the correct path.
 */
export interface UpdateAttributeRequest {
  id: string;
  groupId?: string | null;
  name?: string;
  slug?: string;
  unit?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  isFilterable?: boolean;
}

export interface AttributeValueOptionDTO {
  id: string;
  attributeId: string;
  value: string;
  sortOrder: number;
}

export interface CreateAttributeValueOptionRequest {
  attributeId: string;
  value: string;
  sortOrder?: number;
}

export interface CategoryAttributeLinkDTO {
  categoryId: string;
  attributeId: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface LinkAttributeToCategoryRequest {
  categoryId: string;
  attributeId: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface ProductAttributeValueDTO {
  id: string;
  productId: string;
  attributeId: string;
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  /** Only set when the owning attribute's valueType is LIST. */
  attributeValueId: string | null;
}

export interface SetProductAttributeValueRequest {
  productId: string;
  attributeId: string;
  valueText?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
  attributeValueId?: string | null;
}

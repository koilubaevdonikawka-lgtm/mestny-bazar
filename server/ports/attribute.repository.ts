import type {
  AttributeDTO,
  AttributeGroupDTO,
  AttributeValueOptionDTO,
  CategoryAttributeLinkDTO,
  CreateAttributeGroupRequest,
  CreateAttributeRequest,
  CreateAttributeValueOptionRequest,
  LinkAttributeToCategoryRequest,
  UpdateAttributeGroupRequest,
  UpdateAttributeRequest,
} from "@shared/contracts/product-attributes";

/** Attribute definition reference data — groups, attributes, value options, and category links. */
export interface IAttributeRepository {
  listGroups(): Promise<AttributeGroupDTO[]>;
  getGroupById(id: string): Promise<AttributeGroupDTO | null>;
  createGroup(data: CreateAttributeGroupRequest & { slug: string }): Promise<AttributeGroupDTO>;
  updateGroup(data: UpdateAttributeGroupRequest): Promise<AttributeGroupDTO>;
  groupSlugExists(slug: string, exceptId?: string): Promise<boolean>;

  listAttributes(): Promise<AttributeDTO[]>;
  getAttributeById(id: string): Promise<AttributeDTO | null>;
  createAttribute(data: CreateAttributeRequest & { slug: string }): Promise<AttributeDTO>;
  updateAttribute(data: UpdateAttributeRequest): Promise<AttributeDTO>;
  attributeSlugExists(slug: string, exceptId?: string): Promise<boolean>;

  listValueOptions(attributeId: string): Promise<AttributeValueOptionDTO[]>;
  createValueOption(data: CreateAttributeValueOptionRequest): Promise<AttributeValueOptionDTO>;

  listAttributesForCategory(categoryId: string): Promise<CategoryAttributeLinkDTO[]>;
  linkAttributeToCategory(data: LinkAttributeToCategoryRequest): Promise<CategoryAttributeLinkDTO>;
  unlinkAttributeFromCategory(categoryId: string, attributeId: string): Promise<void>;
}

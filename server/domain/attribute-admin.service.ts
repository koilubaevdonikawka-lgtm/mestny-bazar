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
import type { IAttributeRepository } from "@server/ports/attribute.repository";
import type { IAdminCategoryRepository } from "@server/ports/category-admin.repository";
import {
  AttributeGroupNotFoundError,
  AttributeNotFoundError,
  AttributeValidationError,
} from "@server/domain/attribute.errors";
import { slugify } from "@shared/lib/slugify";

/**
 * Admin CRUD for attribute definitions — groups, attributes, LIST value
 * options, and category links. Mirrors CategoryAdminService's shape (slug
 * auto-generation/uniqueness, name validation, existence checks resolved
 * with a friendly error instead of a raw FK violation).
 */
export class AttributeAdminService {
  constructor(
    private readonly attributes: IAttributeRepository,
    private readonly categories: IAdminCategoryRepository,
  ) {}

  async listGroups(): Promise<AttributeGroupDTO[]> {
    return this.attributes.listGroups();
  }

  async createGroup(data: CreateAttributeGroupRequest): Promise<AttributeGroupDTO> {
    this.validateName(data.name);
    const slug = await this.resolveUniqueGroupSlug(
      data.slug?.trim() || slugify(data.name, "attribute-group"),
    );
    return this.attributes.createGroup({ ...data, slug });
  }

  async updateGroup(data: UpdateAttributeGroupRequest): Promise<AttributeGroupDTO> {
    const existing = await this.attributes.getGroupById(data.id);
    if (!existing) throw new AttributeGroupNotFoundError();

    if (data.name !== undefined) this.validateName(data.name);

    let patch = { ...data };
    if (data.slug !== undefined) {
      patch = { ...patch, slug: await this.resolveUniqueGroupSlug(data.slug.trim(), data.id) };
    }
    return this.attributes.updateGroup(patch);
  }

  async listAttributes(): Promise<AttributeDTO[]> {
    return this.attributes.listAttributes();
  }

  async createAttribute(data: CreateAttributeRequest): Promise<AttributeDTO> {
    this.validateName(data.name);
    if (data.groupId) await this.assertGroupExists(data.groupId);
    const slug = await this.resolveUniqueAttributeSlug(
      data.slug?.trim() || slugify(data.name, "attribute"),
    );
    return this.attributes.createAttribute({ ...data, slug });
  }

  async updateAttribute(data: UpdateAttributeRequest): Promise<AttributeDTO> {
    const existing = await this.attributes.getAttributeById(data.id);
    if (!existing) throw new AttributeNotFoundError();

    if (data.name !== undefined) this.validateName(data.name);
    if (data.groupId) await this.assertGroupExists(data.groupId);

    let patch = { ...data };
    if (data.slug !== undefined) {
      patch = { ...patch, slug: await this.resolveUniqueAttributeSlug(data.slug.trim(), data.id) };
    }
    return this.attributes.updateAttribute(patch);
  }

  async listValueOptions(attributeId: string): Promise<AttributeValueOptionDTO[]> {
    return this.attributes.listValueOptions(attributeId);
  }

  /** Only meaningful for a LIST-type attribute — rejected otherwise so a stray option can't silently attach to e.g. a TEXT attribute. */
  async createValueOption(
    data: CreateAttributeValueOptionRequest,
  ): Promise<AttributeValueOptionDTO> {
    const attribute = await this.attributes.getAttributeById(data.attributeId);
    if (!attribute) throw new AttributeNotFoundError();
    if (attribute.valueType !== "LIST") {
      throw new AttributeValidationError(
        "Value options can only be added to a LIST-type attribute",
        "attributeId",
      );
    }
    if (!data.value?.trim()) {
      throw new AttributeValidationError("Value is required", "value");
    }
    return this.attributes.createValueOption(data);
  }

  async listAttributesForCategory(categoryId: string): Promise<CategoryAttributeLinkDTO[]> {
    return this.attributes.listAttributesForCategory(categoryId);
  }

  async linkAttributeToCategory(
    data: LinkAttributeToCategoryRequest,
  ): Promise<CategoryAttributeLinkDTO> {
    const category = await this.categories.getById(data.categoryId);
    if (!category) throw new AttributeValidationError("Category not found", "categoryId");
    const attribute = await this.attributes.getAttributeById(data.attributeId);
    if (!attribute) throw new AttributeNotFoundError();

    return this.attributes.linkAttributeToCategory(data);
  }

  async unlinkAttributeFromCategory(categoryId: string, attributeId: string): Promise<void> {
    return this.attributes.unlinkAttributeFromCategory(categoryId, attributeId);
  }

  private async resolveUniqueGroupSlug(baseSlug: string, exceptId?: string): Promise<string> {
    if (!baseSlug) throw new AttributeValidationError("Slug is required", "slug");
    if (!(await this.attributes.groupSlugExists(baseSlug, exceptId))) return baseSlug;

    for (let i = 2; i <= 20; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await this.attributes.groupSlugExists(candidate, exceptId))) return candidate;
    }
    return `${baseSlug}-${Date.now()}`;
  }

  private async resolveUniqueAttributeSlug(baseSlug: string, exceptId?: string): Promise<string> {
    if (!baseSlug) throw new AttributeValidationError("Slug is required", "slug");
    if (!(await this.attributes.attributeSlugExists(baseSlug, exceptId))) return baseSlug;

    for (let i = 2; i <= 20; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await this.attributes.attributeSlugExists(candidate, exceptId))) return candidate;
    }
    return `${baseSlug}-${Date.now()}`;
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new AttributeValidationError("Name must be at least 2 characters", "name");
    }
  }

  private async assertGroupExists(groupId: string): Promise<void> {
    const group = await this.attributes.getGroupById(groupId);
    if (!group) throw new AttributeValidationError("Attribute group not found", "groupId");
  }
}

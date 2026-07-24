import type { ISchemaCatalog } from "@server/application/ai-schema-registry/contracts/schema-catalog.contract";
import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

/** Default in-memory schema catalog index. */
export class DefaultSchemaCatalog implements ISchemaCatalog {
  private readonly schemas = new Map<string, Schema>();
  private readonly schemasByName = new Map<string, string>();
  private readonly schemasByCategory = new Map<string, Set<string>>();

  async register(schema: Schema): Promise<void> {
    const existing = this.schemas.get(schema.schemaId);
    if (existing) {
      if (existing.name !== schema.name) {
        this.schemasByName.delete(existing.name);
      }
      if (existing.category !== schema.category) {
        this.removeFromCategory(existing.category, existing.schemaId);
      }
    }

    this.schemas.set(schema.schemaId, schema);
    this.schemasByName.set(schema.name, schema.schemaId);
    this.addToCategory(schema.category, schema.schemaId);
  }

  async remove(schemaId: string): Promise<void> {
    const schema = this.schemas.get(schemaId.trim());
    if (!schema) {
      return;
    }
    this.schemas.delete(schema.schemaId);
    this.schemasByName.delete(schema.name);
    this.removeFromCategory(schema.category, schema.schemaId);
  }

  async findById(schemaId: string): Promise<Schema | null> {
    return this.schemas.get(schemaId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Schema | null> {
    const schemaId = this.schemasByName.get(name.trim());
    if (!schemaId) {
      return null;
    }
    return this.schemas.get(schemaId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Schema[]> {
    const schemaIds = this.schemasByCategory.get(category.trim());
    if (!schemaIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...schemaIds]
        .map((schemaId) => this.schemas.get(schemaId))
        .filter((schema): schema is Schema => schema !== undefined),
    );
  }

  async listAll(): Promise<readonly Schema[]> {
    return Object.freeze([...this.schemas.values()]);
  }

  private addToCategory(category: string, schemaId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.schemasByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(schemaId);
    this.schemasByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, schemaId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.schemasByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(schemaId);
    if (categorySet.size === 0) {
      this.schemasByCategory.delete(normalizedCategory);
    }
  }
}

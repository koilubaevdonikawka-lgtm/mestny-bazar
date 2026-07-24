import type { ICatalogMetadataRepository } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-repository.contract";
import type { CatalogMetadata } from "@server/application/ai-catalog-metadata/models/catalog-metadata.model";

/** In-memory catalog metadata store. */
export class CatalogMetadataRepository implements ICatalogMetadataRepository {
  private readonly entries = new Map<string, CatalogMetadata>();
  private readonly entriesByName = new Map<string, string>();
  private readonly entriesByCategory = new Map<string, Set<string>>();

  async save(entry: CatalogMetadata): Promise<void> {
    const existing = this.entries.get(entry.metadataId);
    if (existing) {
      if (existing.name !== entry.name) {
        this.entriesByName.delete(existing.name);
      }
      if (existing.category !== entry.category) {
        this.removeFromCategory(existing.category, existing.metadataId);
      }
    }

    this.entries.set(entry.metadataId, entry);
    this.entriesByName.set(entry.name, entry.metadataId);
    this.addToCategory(entry.category, entry.metadataId);
  }

  async findById(metadataId: string): Promise<CatalogMetadata | null> {
    return this.entries.get(metadataId.trim()) ?? null;
  }

  async findByName(name: string): Promise<CatalogMetadata | null> {
    const metadataId = this.entriesByName.get(name.trim());
    if (!metadataId) {
      return null;
    }
    return this.findById(metadataId);
  }

  async findByCategory(category: string): Promise<readonly CatalogMetadata[]> {
    const metadataIds = this.entriesByCategory.get(category.trim());
    if (!metadataIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...metadataIds]
        .map((metadataId) => this.entries.get(metadataId))
        .filter((entry): entry is CatalogMetadata => entry !== undefined),
    );
  }

  async findAll(): Promise<readonly CatalogMetadata[]> {
    return Object.freeze([...this.entries.values()]);
  }

  async delete(metadataId: string): Promise<boolean> {
    const entry = await this.findById(metadataId);
    if (!entry) {
      return false;
    }
    this.entries.delete(entry.metadataId);
    this.entriesByName.delete(entry.name);
    this.removeFromCategory(entry.category, entry.metadataId);
    return true;
  }

  private addToCategory(category: string, metadataId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.entriesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(metadataId);
    this.entriesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, metadataId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.entriesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(metadataId);
    if (categorySet.size === 0) {
      this.entriesByCategory.delete(normalizedCategory);
    }
  }
}

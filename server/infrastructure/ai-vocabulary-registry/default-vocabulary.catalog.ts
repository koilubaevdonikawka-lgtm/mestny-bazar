import type { IVocabularyCatalog } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-catalog.contract";
import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Default in-memory vocabulary catalog index. */
export class DefaultVocabularyCatalog implements IVocabularyCatalog {
  private readonly vocabularies = new Map<string, Vocabulary>();
  private readonly vocabulariesByName = new Map<string, string>();
  private readonly vocabulariesByCategory = new Map<string, Set<string>>();

  async register(vocabulary: Vocabulary): Promise<void> {
    const existing = this.vocabularies.get(vocabulary.vocabularyId);
    if (existing) {
      if (existing.name !== vocabulary.name) {
        this.vocabulariesByName.delete(existing.name);
      }
      if (existing.category !== vocabulary.category) {
        this.removeFromCategory(existing.category, existing.vocabularyId);
      }
    }

    this.vocabularies.set(vocabulary.vocabularyId, vocabulary);
    this.vocabulariesByName.set(vocabulary.name, vocabulary.vocabularyId);
    this.addToCategory(vocabulary.category, vocabulary.vocabularyId);
  }

  async remove(vocabularyId: string): Promise<void> {
    const vocabulary = this.vocabularies.get(vocabularyId.trim());
    if (!vocabulary) {
      return;
    }
    this.vocabularies.delete(vocabulary.vocabularyId);
    this.vocabulariesByName.delete(vocabulary.name);
    this.removeFromCategory(vocabulary.category, vocabulary.vocabularyId);
  }

  async findById(vocabularyId: string): Promise<Vocabulary | null> {
    return this.vocabularies.get(vocabularyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Vocabulary | null> {
    const vocabularyId = this.vocabulariesByName.get(name.trim());
    if (!vocabularyId) {
      return null;
    }
    return this.vocabularies.get(vocabularyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Vocabulary[]> {
    const vocabularyIds = this.vocabulariesByCategory.get(category.trim());
    if (!vocabularyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...vocabularyIds]
        .map((vocabularyId) => this.vocabularies.get(vocabularyId))
        .filter((vocabulary): vocabulary is Vocabulary => vocabulary !== undefined),
    );
  }

  async listAll(): Promise<readonly Vocabulary[]> {
    return Object.freeze([...this.vocabularies.values()]);
  }

  private addToCategory(category: string, vocabularyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.vocabulariesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(vocabularyId);
    this.vocabulariesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, vocabularyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.vocabulariesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(vocabularyId);
    if (categorySet.size === 0) {
      this.vocabulariesByCategory.delete(normalizedCategory);
    }
  }
}

/**
 * AI Vocabulary Registry — unified registry for AI vocabularies.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IVocabularyCatalog } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-catalog.contract";
import type { IVocabularyRepository } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-repository.contract";
import type { IVocabularySerializer } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-serializer.contract";
import type { IVocabularyStatisticsProvider } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-statistics-provider.contract";
import type { IVocabularyValidator } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-validator.contract";
import {
  createVocabulary,
  type DeleteVocabularyResult,
  type FindVocabularyByNameResult,
  type ListVocabulariesByCategoryResult,
  type ListVocabulariesResult,
  type RegisterVocabularyInput,
  type Vocabulary,
  type VocabularyRegistryStatistics,
  type UpdateVocabularyInput,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiVocabularyRegistryService {
  constructor(
    private readonly vocabularyRepository: IVocabularyRepository,
    private readonly vocabularyCatalog: IVocabularyCatalog,
    private readonly vocabularyValidator: IVocabularyValidator,
    private readonly vocabularySerializer: IVocabularySerializer,
    private readonly statisticsProvider: IVocabularyStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerVocabulary(input: RegisterVocabularyInput): Promise<Vocabulary> {
    const validation = await this.vocabularyValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.vocabularyRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Vocabulary already exists with name: ${input.name.trim()}`);
    }

    const vocabulary = createVocabulary({
      vocabularyId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.vocabularyRepository.save(vocabulary);
    await this.vocabularyCatalog.register(vocabulary);
    return vocabulary;
  }

  async getVocabulary(vocabularyId: string): Promise<Vocabulary | null> {
    return this.vocabularyRepository.findById(vocabularyId.trim());
  }

  async listVocabularies(): Promise<ListVocabulariesResult> {
    const vocabularies = Object.freeze(
      [...(await this.vocabularyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ vocabularies, total: vocabularies.length });
  }

  async updateVocabulary(input: UpdateVocabularyInput): Promise<Vocabulary> {
    const vocabularyId = input.vocabularyId.trim();
    const existing = await this.vocabularyRepository.findById(vocabularyId);
    if (!existing) {
      throw new Error(`Vocabulary not found: ${vocabularyId}`);
    }

    const validation = await this.vocabularyValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.vocabularyRepository.findByName(input.name.trim());
      if (duplicate && duplicate.vocabularyId !== existing.vocabularyId) {
        throw new Error(`Vocabulary already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createVocabulary({
      vocabularyId: existing.vocabularyId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.vocabularyRepository.save(updated);
    await this.vocabularyCatalog.register(updated);
    return updated;
  }

  async deleteVocabulary(vocabularyId: string): Promise<DeleteVocabularyResult> {
    const normalizedVocabularyId = vocabularyId.trim();
    const deleted = await this.vocabularyRepository.delete(normalizedVocabularyId);
    if (deleted) {
      await this.vocabularyCatalog.remove(normalizedVocabularyId);
    }
    return Object.freeze({ vocabularyId: normalizedVocabularyId, deleted });
  }

  async findVocabularyByName(name: string): Promise<FindVocabularyByNameResult> {
    const normalizedName = name.trim();
    const vocabulary = await this.vocabularyRepository.findByName(normalizedName);
    return Object.freeze({ vocabulary });
  }

  async listVocabulariesByCategory(
    category: string,
  ): Promise<ListVocabulariesByCategoryResult> {
    const normalizedCategory = category.trim();
    const vocabularies = Object.freeze(
      [...(await this.vocabularyRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      vocabularies,
      total: vocabularies.length,
      category: normalizedCategory,
    });
  }

  async getVocabularyRegistryStatistics(): Promise<VocabularyRegistryStatistics> {
    const vocabularies = await this.vocabularyRepository.findAll();
    const activeVocabularies = vocabularies.filter(
      (vocabulary) => vocabulary.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(vocabularies.map((vocabulary) => vocabulary.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalVocabularies: vocabularies.length,
      activeVocabularies,
      categories,
    });
  }

  async serializeVocabulary(vocabulary: Vocabulary): Promise<string> {
    return this.vocabularySerializer.serialize(vocabulary);
  }

  async deserializeVocabulary(serialized: string): Promise<Vocabulary> {
    return this.vocabularySerializer.deserialize(serialized);
  }
}

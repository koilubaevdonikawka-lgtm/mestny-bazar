import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

export interface IVocabularyRepository {
  save(vocabulary: Vocabulary): Promise<void>;
  findById(vocabularyId: string): Promise<Vocabulary | null>;
  findByName(name: string): Promise<Vocabulary | null>;
  findByCategory(category: string): Promise<readonly Vocabulary[]>;
  findAll(): Promise<readonly Vocabulary[]>;
  delete(vocabularyId: string): Promise<boolean>;
}

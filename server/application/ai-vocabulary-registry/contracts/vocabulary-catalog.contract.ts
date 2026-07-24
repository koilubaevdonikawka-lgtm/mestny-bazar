import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

export interface IVocabularyCatalog {
  register(vocabulary: Vocabulary): Promise<void>;
  remove(vocabularyId: string): Promise<void>;
  findById(vocabularyId: string): Promise<Vocabulary | null>;
  findByName(name: string): Promise<Vocabulary | null>;
  findByCategory(category: string): Promise<readonly Vocabulary[]>;
  listAll(): Promise<readonly Vocabulary[]>;
}

import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Future integration point for vocabulary synchronization. Not wired yet. */
export interface IVocabularySynchronizationProvider {
  synchronize(vocabularies: readonly Vocabulary[]): Promise<void>;
}

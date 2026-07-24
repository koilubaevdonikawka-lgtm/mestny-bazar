import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Future integration point for vocabulary import. Not wired yet. */
export interface IVocabularyImportProvider {
  importFrom(source: string): Promise<readonly Vocabulary[]>;
}

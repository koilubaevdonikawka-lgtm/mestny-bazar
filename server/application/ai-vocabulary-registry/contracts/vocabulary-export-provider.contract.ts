import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Future integration point for vocabulary export. Not wired yet. */
export interface IVocabularyExportProvider {
  exportTo(vocabularies: readonly Vocabulary[]): Promise<string>;
}

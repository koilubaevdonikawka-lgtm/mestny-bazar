import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** Future integration point for external vocabulary providers. Not wired yet. */
export interface IRemoteVocabularyProvider {
  fetchRemote(vocabularyId: string): Promise<Vocabulary | null>;
  pushRemote(vocabulary: Vocabulary): Promise<void>;
}

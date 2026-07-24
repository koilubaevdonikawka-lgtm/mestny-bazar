import type { Vocabulary } from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

export interface IVocabularySerializer {
  serialize(vocabulary: Vocabulary): Promise<string>;
  deserialize(serialized: string): Promise<Vocabulary>;
}

import type { IVocabularySerializer } from "@server/application/ai-vocabulary-registry/contracts/vocabulary-serializer.contract";
import {
  createVocabulary,
  type Vocabulary,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

/** JSON-based vocabulary serializer. */
export class JsonVocabularySerializer implements IVocabularySerializer {
  async serialize(vocabulary: Vocabulary): Promise<string> {
    return JSON.stringify(vocabulary);
  }

  async deserialize(serialized: string): Promise<Vocabulary> {
    if (!serialized.trim()) {
      throw new Error("Serialized vocabulary cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Vocabulary>;
    return createVocabulary({
      vocabularyId: parsed.vocabularyId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

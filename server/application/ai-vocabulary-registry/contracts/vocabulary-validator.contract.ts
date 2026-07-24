import type {
  RegisterVocabularyInput,
  Vocabulary,
  UpdateVocabularyInput,
} from "@server/application/ai-vocabulary-registry/models/vocabulary.model";

export interface VocabularyValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IVocabularyValidator {
  validateRegistration(input: RegisterVocabularyInput): Promise<VocabularyValidationResult>;
  validateUpdate(
    existing: Vocabulary,
    input: UpdateVocabularyInput,
  ): Promise<VocabularyValidationResult>;
}

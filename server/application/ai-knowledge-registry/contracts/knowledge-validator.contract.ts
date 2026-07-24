import type {
  KnowledgeSource,
  RegisterKnowledgeSourceInput,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

export interface KnowledgeValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IKnowledgeValidator {
  validateRegistration(input: RegisterKnowledgeSourceInput): Promise<KnowledgeValidationResult>;
  validateUpdate(
    existing: KnowledgeSource,
    input: UpdateKnowledgeSourceInput,
  ): Promise<KnowledgeValidationResult>;
}

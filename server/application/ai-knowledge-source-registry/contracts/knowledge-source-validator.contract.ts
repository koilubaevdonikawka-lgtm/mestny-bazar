import type {
  RegisterKnowledgeSourceInput,
  KnowledgeSource,
  UpdateKnowledgeSourceInput,
} from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

export interface KnowledgeSourceValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IKnowledgeSourceValidator {
  validateRegistration(input: RegisterKnowledgeSourceInput): Promise<KnowledgeSourceValidationResult>;
  validateUpdate(
    existing: KnowledgeSource,
    input: UpdateKnowledgeSourceInput,
  ): Promise<KnowledgeSourceValidationResult>;
}

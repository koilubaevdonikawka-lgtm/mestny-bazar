import type {
  RegisterKnowledgePackageInput,
  KnowledgePackage,
  UpdateKnowledgePackageInput,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

export interface KnowledgePackageValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IKnowledgePackageValidator {
  validateRegistration(input: RegisterKnowledgePackageInput): Promise<KnowledgePackageValidationResult>;
  validateUpdate(
    existing: KnowledgePackage,
    input: UpdateKnowledgePackageInput,
  ): Promise<KnowledgePackageValidationResult>;
}

import type {
  RegisterKnowledgeGraphInput,
  KnowledgeGraph,
  UpdateKnowledgeGraphInput,
} from "@server/application/ai-knowledge-graph-registry/models/knowledge-graph.model";

export interface KnowledgeGraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IKnowledgeGraphValidator {
  validateRegistration(input: RegisterKnowledgeGraphInput): Promise<KnowledgeGraphValidationResult>;
  validateUpdate(
    existing: KnowledgeGraph,
    input: UpdateKnowledgeGraphInput,
  ): Promise<KnowledgeGraphValidationResult>;
}

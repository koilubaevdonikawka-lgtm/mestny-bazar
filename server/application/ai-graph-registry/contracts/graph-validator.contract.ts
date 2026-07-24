import type {
  RegisterGraphInput,
  Graph,
  UpdateGraphInput,
} from "@server/application/ai-graph-registry/models/graph.model";

export interface GraphValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IGraphValidator {
  validateRegistration(input: RegisterGraphInput): Promise<GraphValidationResult>;
  validateUpdate(existing: Graph, input: UpdateGraphInput): Promise<GraphValidationResult>;
}

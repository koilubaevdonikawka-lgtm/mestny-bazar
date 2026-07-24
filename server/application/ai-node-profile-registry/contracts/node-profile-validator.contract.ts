import type {
  NodeProfile,
  RegisterNodeProfileInput,
  UpdateNodeProfileInput,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";

export interface NodeProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface INodeProfileValidator {
  validateRegistration(input: RegisterNodeProfileInput): Promise<NodeProfileValidationResult>;
  validateUpdate(
    existing: NodeProfile,
    input: UpdateNodeProfileInput,
  ): Promise<NodeProfileValidationResult>;
}

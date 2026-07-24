import type {
  ClusterProfile,
  RegisterClusterProfileInput,
  UpdateClusterProfileInput,
} from "@server/application/ai-cluster-profile-registry/models/cluster-profile.model";

export interface ClusterProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IClusterProfileValidator {
  validateRegistration(input: RegisterClusterProfileInput): Promise<ClusterProfileValidationResult>;
  validateUpdate(
    existing: ClusterProfile,
    input: UpdateClusterProfileInput,
  ): Promise<ClusterProfileValidationResult>;
}

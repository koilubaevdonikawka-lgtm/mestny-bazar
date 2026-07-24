import type {
  AiCapability,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-discovery/models/capability.model";

export interface ICapabilityValidator {
  validateRegistration(input: RegisterCapabilityInput): void;
  validateUpdate(existing: AiCapability, input: UpdateCapabilityInput): void;
}

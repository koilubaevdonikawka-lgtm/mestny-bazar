import type {
  ISessionValidator,
  SessionValidationResult,
} from "@server/application/ai-session-management/contracts/session-validator.contract";
import type {
  CreateSessionInput,
  Session,
  UpdateSessionInput,
} from "@server/application/ai-session-management/models/session.model";

/** Default session validator. */
export class DefaultSessionValidator implements ISessionValidator {
  async validateCreation(input: CreateSessionInput): Promise<SessionValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Session name is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "closed") {
      errors.push("Session status must be 'active' or 'closed'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(existing: Session, input: UpdateSessionInput): Promise<SessionValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Session name cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "closed") {
      errors.push("Session status must be 'active' or 'closed'.");
    }

    if (!existing) {
      errors.push("Session is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}

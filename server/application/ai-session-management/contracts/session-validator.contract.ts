import type {
  CreateSessionInput,
  Session,
  UpdateSessionInput,
} from "@server/application/ai-session-management/models/session.model";

export interface SessionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface ISessionValidator {
  validateCreation(input: CreateSessionInput): Promise<SessionValidationResult>;
  validateUpdate(existing: Session, input: UpdateSessionInput): Promise<SessionValidationResult>;
}

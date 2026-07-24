export interface AuthenticationAuditRecord {
  readonly userId: string;
  readonly sessionId?: string;
  readonly eventType: "login" | "logout" | "refresh" | "revoke" | "validate";
  readonly success: boolean;
  readonly reason?: string;
}

export interface IAuthenticationAuditProvider {
  recordEvent(record: AuthenticationAuditRecord): Promise<void>;
}

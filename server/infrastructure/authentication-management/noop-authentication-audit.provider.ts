import type {
  AuthenticationAuditRecord,
  IAuthenticationAuditProvider,
} from "@server/application/authentication-management/contracts/authentication-audit-provider.contract";

/** No-op authentication audit provider for future audit integrations. */
export class NoopAuthenticationAuditProvider implements IAuthenticationAuditProvider {
  async recordEvent(_record: AuthenticationAuditRecord): Promise<void> {
    return;
  }
}

import type {
  AuthorizationAuditRecord,
  IAuthorizationAuditProvider,
} from "@server/application/authorization-management/contracts/authorization-audit-provider.contract";

/** No-op authorization audit provider for future audit integrations. */
export class NoopAuthorizationAuditProvider implements IAuthorizationAuditProvider {
  async recordCheck(_record: AuthorizationAuditRecord): Promise<void> {
    return;
  }
}

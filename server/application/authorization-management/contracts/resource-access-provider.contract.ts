import type {
  AuthorizationDecision,
  AuthorizationPolicy,
} from "@server/application/authorization-management/models/authorization.model";

export interface ResourceAccessContext {
  readonly userId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly resource: string;
  readonly action: string;
  readonly policies: readonly AuthorizationPolicy[];
}

export interface IResourceAccessProvider {
  evaluateAccess(context: ResourceAccessContext): Promise<AuthorizationDecision>;
}

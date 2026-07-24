import type { IAuthorizationPolicyRepository } from "@server/application/authorization-management/contracts/authorization-policy-repository.contract";
import {
  createAuthorizationPolicy,
  type AuthorizationPolicy,
} from "@server/application/authorization-management/models/authorization.model";

function matchesPattern(resource: string, pattern: string): boolean {
  if (pattern === "*") {
    return true;
  }

  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -2);
    return resource === prefix || resource.startsWith(`${prefix}/`);
  }

  return resource === pattern;
}

/** In-memory authorization policy store. */
export class AuthorizationPolicyRepository implements IAuthorizationPolicyRepository {
  private readonly policies = new Map<string, AuthorizationPolicy>();

  constructor() {
    this.seedDefaultPolicies();
  }

  async save(policy: AuthorizationPolicy): Promise<void> {
    this.policies.set(policy.policyId, policy);
  }

  async findById(policyId: string): Promise<AuthorizationPolicy | null> {
    return this.policies.get(policyId.trim()) ?? null;
  }

  async findAll(): Promise<readonly AuthorizationPolicy[]> {
    return Object.freeze([...this.policies.values()]);
  }

  async findByResourcePattern(resource: string): Promise<readonly AuthorizationPolicy[]> {
    return Object.freeze(
      [...this.policies.values()].filter((policy) =>
        matchesPattern(resource.trim(), policy.resourcePattern),
      ),
    );
  }

  async findByAction(action: string): Promise<readonly AuthorizationPolicy[]> {
    const normalizedAction = action.trim();
    return Object.freeze(
      [...this.policies.values()].filter(
        (policy) => policy.action === "*" || policy.action === normalizedAction,
      ),
    );
  }

  private seedDefaultPolicies(): void {
    const defaults: AuthorizationPolicy[] = [
      createAuthorizationPolicy({
        policyId: "policy-admin-all",
        name: "Admin full access",
        resourcePattern: "*",
        action: "*",
        requiredRoles: ["admin"],
        requiredPermissions: [],
        effect: "allow",
      }),
      createAuthorizationPolicy({
        policyId: "policy-seller-products",
        name: "Seller product management",
        resourcePattern: "products/*",
        action: "write",
        requiredRoles: ["seller"],
        requiredPermissions: ["products.write"],
        effect: "allow",
      }),
      createAuthorizationPolicy({
        policyId: "policy-customer-orders-read",
        name: "Customer order read",
        resourcePattern: "orders/*",
        action: "read",
        requiredRoles: ["customer"],
        requiredPermissions: ["orders.read"],
        effect: "allow",
      }),
    ];

    for (const policy of defaults) {
      this.policies.set(policy.policyId, policy);
    }
  }
}

export { matchesPattern };

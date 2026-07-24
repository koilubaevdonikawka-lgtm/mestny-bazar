import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createPolicyDescriptor,
  createPolicyException,
  createRuleDescriptor,
  PolicyTokens,
  type PolicyExceptionRegistry,
  type PolicyPlatform,
  type RuleRegistry,
  type ScopeResolver,
} from "@server/platform/policy/policy";

/** Activates policy platform metadata and default policy catalog. */
export function activatePolicyPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-policy",
      name: "Policy Platform",
      path: "server/platform/policy",
      components: [
        "PolicyPlatform",
        "PolicyManager",
        "PolicyRegistry",
        "PolicyEvaluator",
        "PolicyEnforcementEngine",
        "RuleRegistry",
        "ScopeResolver",
        "PolicyExceptionRegistry",
      ],
      dependencies: [
        "platform-governance",
        "platform-documentation",
        "platform-runtime",
        "platform-gateway",
        "platform-features",
        "platform-integration",
      ],
    }),
  });

  const policyPlatform = provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform);
  const ruleRegistry = provider.resolve<RuleRegistry>(PolicyTokens.RuleRegistry);
  const exceptionRegistry = provider.resolve<PolicyExceptionRegistry>(
    PolicyTokens.PolicyExceptionRegistry,
  );
  const scopeResolver = provider.resolve<ScopeResolver>(PolicyTokens.ScopeResolver);

  policyPlatform.registerPolicy(
    createPolicyDescriptor({
      id: "policy-architecture-modules",
      name: "Architecture Module Documentation",
      category: "architecture",
      checkKind: "architecture",
      description: "Ensures modules and platforms are documented",
    }),
  );

  policyPlatform.registerPolicy(
    createPolicyDescriptor({
      id: "policy-platform-compatibility",
      name: "Platform Compatibility",
      category: "platform",
      checkKind: "compatibility",
      description: "Validates API version and feature compatibility metadata",
    }),
  );

  policyPlatform.registerPolicy(
    createPolicyDescriptor({
      id: "policy-provider-registry",
      name: "Provider Registry Access",
      category: "provider",
      checkKind: "providers",
      description: "Ensures provider registry is accessible",
    }),
  );

  policyPlatform.registerPolicy(
    createPolicyDescriptor({
      id: "policy-runtime-configuration",
      name: "Runtime Configuration",
      category: "runtime",
      checkKind: "configuration",
      description: "Validates runtime configuration is loaded",
    }),
  );

  policyPlatform.registerPolicy(
    createPolicyDescriptor({
      id: "policy-operational-health",
      name: "Operational Platform Health",
      category: "operational",
      checkKind: "platform-health",
      description: "Checks runtime health service integration",
    }),
  );

  ruleRegistry.register(
    createRuleDescriptor({
      id: "rule-dependency-layering",
      name: "Dependency Layering",
      kind: "dependency",
      pattern: "bcm->domain",
      description: "BCM must not depend on infrastructure directly",
    }),
  );

  ruleRegistry.register(
    createRuleDescriptor({
      id: "rule-naming-kebab",
      name: "Kebab-case Naming",
      kind: "naming",
      pattern: "^[a-z0-9-]+$",
    }),
  );

  ruleRegistry.register(
    createRuleDescriptor({
      id: "rule-layer-platform",
      name: "Platform Layer Isolation",
      kind: "layer",
      pattern: "server/platform/*",
    }),
  );

  ruleRegistry.register(
    createRuleDescriptor({
      id: "rule-module-registration",
      name: "Module Registration",
      kind: "module",
      pattern: "register*Module",
    }),
  );

  ruleRegistry.register(
    createRuleDescriptor({
      id: "rule-version-semver",
      name: "Semantic Versioning",
      kind: "version",
      pattern: "^\\d+\\.\\d+\\.\\d+$",
    }),
  );

  exceptionRegistry.register(
    createPolicyException({
      id: "exception-legacy-api",
      policyId: "policy-platform-compatibility",
      kind: "temporary",
      reason: "Legacy API compatibility window",
      expiresAt: new Date(Date.now() + 86_400_000 * 30).toISOString(),
    }),
  );

  void scopeResolver.resolveAll();
  policyPlatform.generatePolicyReport();
}

import type { IPolicyEvaluator } from "@server/platform/policy/policy/contracts";
import type { IPolicyExceptionRegistry } from "@server/platform/policy/policy/contracts";
import {
  createPolicyEvaluation,
  type PolicyDescriptor,
  type PolicyEvaluation,
} from "@server/platform/policy/policy/models";
import { createPolicyEvaluatedEvent } from "@server/platform/policy/policy/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { FeaturePlatform } from "@server/platform/features/features/feature-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider, IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Evaluates policies using platform metadata (no BCM access). */
export class PolicyEvaluator implements IPolicyEvaluator {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly healthService: IHealthService,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly gateway: GatewayPlatform,
    private readonly featurePlatform: FeaturePlatform,
    private readonly providerRegistry: ProviderRegistry,
    private readonly exceptionRegistry: IPolicyExceptionRegistry,
  ) {}

  evaluate(policy: PolicyDescriptor): PolicyEvaluation {
    if (!policy.enabled) {
      return this.storeEvaluation(
        createPolicyEvaluation({
          policyId: policy.id,
          policyName: policy.name,
          passed: true,
          reason: "policy-disabled",
        }),
      );
    }

    if (this.exceptionRegistry.hasException(policy.id)) {
      return this.storeEvaluation(
        createPolicyEvaluation({
          policyId: policy.id,
          policyName: policy.name,
          passed: true,
          reason: "exception-approved",
        }),
      );
    }

    const evaluation = this.evaluateByKind(policy);
    return this.storeEvaluation(evaluation);
  }

  evaluateAll(policies: readonly PolicyDescriptor[]): readonly PolicyEvaluation[] {
    return Object.freeze(policies.map((policy) => this.evaluate(policy)));
  }

  private evaluateByKind(policy: PolicyDescriptor): PolicyEvaluation {
    switch (policy.checkKind) {
      case "architecture":
        return this.evaluateArchitecture(policy);
      case "compatibility":
        return this.evaluateCompatibility(policy);
      case "providers":
        return this.evaluateProviders(policy);
      case "configuration":
        return this.evaluateConfiguration(policy);
      case "platform-health":
        return this.evaluatePlatformHealth(policy);
      default:
        return createPolicyEvaluation({
          policyId: policy.id,
          policyName: policy.name,
          passed: false,
          reason: "unknown-check-kind",
        });
    }
  }

  private evaluateArchitecture(policy: PolicyDescriptor): PolicyEvaluation {
    const bundle = this.documentation.generateDocumentation();
    const passed = bundle.summary.moduleCount > 0 && bundle.summary.platformCount > 0;
    void this.governance;
    return createPolicyEvaluation({
      policyId: policy.id,
      policyName: policy.name,
      passed,
      reason: passed ? "architecture-documented" : "architecture-incomplete",
      metadata: Object.freeze({
        moduleCount: bundle.summary.moduleCount,
        platformCount: bundle.summary.platformCount,
      }),
    });
  }

  private evaluateCompatibility(policy: PolicyDescriptor): PolicyEvaluation {
    const versions = this.gateway.supportedVersions();
    const features = this.featurePlatform.listFeatures();
    const passed = versions.length > 0;
    return createPolicyEvaluation({
      policyId: policy.id,
      policyName: policy.name,
      passed,
      reason: passed ? "compatibility-metadata-available" : "no-api-versions",
      metadata: Object.freeze({
        apiVersionCount: versions.length,
        featureCount: features.length,
      }),
    });
  }

  private evaluateProviders(policy: PolicyDescriptor): PolicyEvaluation {
    const providers = this.providerRegistry.list();
    const passed = providers.length > 0;
    return createPolicyEvaluation({
      policyId: policy.id,
      policyName: policy.name,
      passed,
      reason: passed ? "providers-registered" : "no-providers-registered",
      metadata: Object.freeze({ providerCount: providers.length }),
    });
  }

  private evaluateConfiguration(policy: PolicyDescriptor): PolicyEvaluation {
    const snapshot = this.configuration.snapshot();
    const passed = Boolean(snapshot.loadedAt);
    return createPolicyEvaluation({
      policyId: policy.id,
      policyName: policy.name,
      passed,
      reason: passed ? "configuration-loaded" : "configuration-missing",
      metadata: Object.freeze({ source: snapshot.source }),
    });
  }

  private evaluatePlatformHealth(policy: PolicyDescriptor): PolicyEvaluation {
    const integrated = Boolean(this.healthService);
    return createPolicyEvaluation({
      policyId: policy.id,
      policyName: policy.name,
      passed: integrated,
      reason: integrated ? "runtime-health-integrated" : "runtime-health-unavailable",
    });
  }

  private storeEvaluation(evaluation: PolicyEvaluation): PolicyEvaluation {
    createPolicyEvaluatedEvent(evaluation);
    return evaluation;
  }
}

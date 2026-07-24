import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { PolicyTokens } from "@server/platform/policy/policy/tokens";
import { ReleaseTokens } from "@server/platform/release/release/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type {
  IConfigurationProvider,
  IHealthService,
} from "@server/platform/runtime/runtime/contracts";
import {
  CertificationEngine,
  ChecklistRegistry,
  ComplianceManager,
  CompliancePlatform,
  ComplianceRegistry,
  ComplianceReportGenerator,
  ComplianceScoringEngine,
  ComplianceTokens,
  ComplianceValidator,
} from "@server/platform/compliance/compliance";

/** Registers compliance platform services in the DI container. */
export function registerCompliancePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(ComplianceTokens.ComplianceRegistry, () => new ComplianceRegistry());
  registry.registerSingleton(ComplianceTokens.ChecklistRegistry, () => new ChecklistRegistry());
  registry.registerSingleton(ComplianceTokens.CertificationEngine, () => new CertificationEngine());
  registry.registerSingleton(ComplianceTokens.ComplianceScoringEngine, () => new ComplianceScoringEngine());
  registry.registerSingleton(ComplianceTokens.ComplianceReportGenerator, () => new ComplianceReportGenerator());

  registry.registerSingleton(
    ComplianceTokens.ComplianceValidator,
    (provider) =>
      new ComplianceValidator(
        provider.resolve<IConfigurationProvider>(RuntimeTokens.ConfigurationService),
        provider.resolve<IHealthService>(RuntimeTokens.HealthService),
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<GovernancePlatform>(GovernanceTokens.GovernancePlatform),
        provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform),
        provider.resolve<ReleasePlatform>(ReleaseTokens.ReleasePlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    ComplianceTokens.ComplianceManager,
    (provider) =>
      new ComplianceManager(
        provider.resolve(ComplianceTokens.ComplianceRegistry),
        provider.resolve(ComplianceTokens.ComplianceValidator),
        provider.resolve(ComplianceTokens.CertificationEngine),
        provider.resolve(ComplianceTokens.ComplianceScoringEngine),
        provider.resolve(ComplianceTokens.ComplianceReportGenerator),
      ),
  );

  registry.registerSingleton(ComplianceTokens.CompliancePlatform, (provider) =>
    new CompliancePlatform(
      provider.resolve(ComplianceTokens.ComplianceManager),
      provider.resolve(ComplianceTokens.ComplianceScoringEngine),
      provider.resolve(ComplianceTokens.ComplianceRegistry),
      provider.resolve(ComplianceTokens.ComplianceValidator),
    ),
  );
}

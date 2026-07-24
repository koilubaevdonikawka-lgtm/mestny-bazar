import { BootstrapTokens } from "@server/bootstrap/tokens";
import { DeveloperTokens } from "@server/platform/developer/developer/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { GovernanceTokens } from "@server/platform/governance/governance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { RuntimeTokens } from "@server/platform/runtime/runtime/tokens";
import { TestingTokens } from "@server/platform/testing/testing/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";

export interface DiTokenDescriptor {
  readonly label: string;
  readonly token: symbol;
}

/** Known DI tokens inspected by the developer platform. */
export const DEVELOPER_DI_TOKEN_CATALOG: readonly DiTokenDescriptor[] = Object.freeze([
  ...Object.entries(BootstrapTokens)
    .filter(([key]) => key.endsWith("Module"))
    .map(([label, token]) => ({ label, token: token as symbol })),
  { label: "ProviderRegistry", token: IntegrationTokens.ProviderRegistry },
  { label: "HealthService", token: RuntimeTokens.HealthService },
  { label: "DiagnosticsService", token: RuntimeTokens.DiagnosticsService },
  { label: "TestingPlatform", token: TestingTokens.TestingPlatform },
  { label: "DocumentationPlatform", token: DocumentationTokens.DocumentationPlatform },
  { label: "GovernancePlatform", token: GovernanceTokens.GovernancePlatform },
  { label: "DeveloperPlatform", token: DeveloperTokens.DeveloperPlatform },
]);

/** Returns registered DI token labels from the service registry. */
export function listRegisteredDiTokens(registry: ServiceRegistry): readonly string[] {
  return Object.freeze(
    DEVELOPER_DI_TOKEN_CATALOG.filter((entry) => registry.has(entry.token)).map(
      (entry) => entry.label,
    ),
  );
}

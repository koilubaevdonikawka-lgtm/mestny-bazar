import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  ComplianceTokens,
  createChecklistDescriptor,
  createChecklistItem,
  createComplianceStandard,
  type ChecklistRegistry,
  type CompliancePlatform,
} from "@server/platform/compliance/compliance";

/** Activates compliance platform metadata and default standards catalog. */
export function activateCompliancePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-compliance",
      name: "Compliance Platform",
      path: "server/platform/compliance",
      components: [
        "CompliancePlatform",
        "ComplianceManager",
        "ComplianceRegistry",
        "ComplianceValidator",
        "CertificationEngine",
        "ChecklistRegistry",
        "ComplianceScoringEngine",
        "ComplianceReportGenerator",
      ],
      dependencies: [
        "platform-policy",
        "platform-governance",
        "platform-documentation",
        "platform-release",
        "platform-runtime",
        "platform-integration",
      ],
    }),
  });

  const compliancePlatform = provider.resolve<CompliancePlatform>(
    ComplianceTokens.CompliancePlatform,
  );
  const checklistRegistry = provider.resolve<ChecklistRegistry>(
    ComplianceTokens.ChecklistRegistry,
  );

  compliancePlatform.registerStandard(
    createComplianceStandard({
      id: "standard-architecture-modules",
      name: "Architecture Module Standard",
      category: "architecture",
      checkKind: "architecture",
      description: "Modules and platforms must be documented",
      weight: 2,
    }),
  );

  compliancePlatform.registerStandard(
    createComplianceStandard({
      id: "standard-platform-dependencies",
      name: "Platform Dependency Standard",
      category: "platform",
      checkKind: "dependencies",
      description: "Dependency graph must be available",
    }),
  );

  compliancePlatform.registerStandard(
    createComplianceStandard({
      id: "standard-security-configuration",
      name: "Security Configuration Standard",
      category: "security",
      checkKind: "configuration",
      description: "Runtime configuration must be loaded",
      weight: 2,
    }),
  );

  compliancePlatform.registerStandard(
    createComplianceStandard({
      id: "standard-operational-health",
      name: "Operational Health Standard",
      category: "operational",
      checkKind: "platform-health",
      description: "Platform health metadata must be available",
    }),
  );

  compliancePlatform.registerStandard(
    createComplianceStandard({
      id: "standard-release-governance",
      name: "Release Governance Standard",
      category: "release",
      checkKind: "governance",
      description: "Governance policies must be registered before release",
      weight: 2,
    }),
  );

  checklistRegistry.register(
    createChecklistDescriptor({
      id: "checklist-architecture",
      name: "Architecture Checklist",
      kind: "architecture",
      items: [
        createChecklistItem({ id: "arch-modules", label: "Modules documented" }),
        createChecklistItem({ id: "arch-platforms", label: "Platforms registered" }),
      ],
    }),
  );

  checklistRegistry.register(
    createChecklistDescriptor({
      id: "checklist-release",
      name: "Release Checklist",
      kind: "release",
      items: [
        createChecklistItem({ id: "rel-governance", label: "Governance policies evaluated" }),
        createChecklistItem({ id: "rel-manifest", label: "Release manifest ready" }),
      ],
    }),
  );

  checklistRegistry.register(
    createChecklistDescriptor({
      id: "checklist-platform",
      name: "Platform Checklist",
      kind: "platform",
      items: [createChecklistItem({ id: "plat-config", label: "Configuration loaded" })],
    }),
  );

  checklistRegistry.register(
    createChecklistDescriptor({
      id: "checklist-operations",
      name: "Operations Checklist",
      kind: "operations",
      items: [createChecklistItem({ id: "ops-health", label: "Health service integrated" })],
    }),
  );

  checklistRegistry.register(
    createChecklistDescriptor({
      id: "checklist-sdk",
      name: "SDK Checklist",
      kind: "sdk",
      items: [createChecklistItem({ id: "sdk-contracts", label: "Contracts documented" })],
    }),
  );

  compliancePlatform.generateReport("readiness");
  void compliancePlatform.readinessScore();
}

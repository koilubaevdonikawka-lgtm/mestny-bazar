export interface ArchitectureSummary {
  readonly generatedAt: string;
  readonly moduleCount: number;
  readonly platformCount: number;
  readonly providerCount: number;
  readonly dependencyCount: number;
  readonly contractCount: number;
  readonly domainEventCount: number;
}

export interface ModuleCatalogEntry {
  readonly module: import("./module-descriptor.model").ModuleDescriptor;
  readonly registered: boolean;
}

export interface ModuleCatalog {
  readonly entries: readonly ModuleCatalogEntry[];
}

export interface DependencyGraph {
  readonly nodes: readonly import("./architecture-node.model").ArchitectureNode[];
  readonly edges: readonly import("./architecture-dependency.model").ArchitectureDependency[];
}

export interface PublicApiEntry {
  readonly moduleId: string;
  readonly moduleName: string;
  readonly methods: readonly string[];
}

export interface PublicApiCatalog {
  readonly entries: readonly PublicApiEntry[];
}

export interface ProviderCatalog {
  readonly providers: readonly import("./provider-descriptor.model").DocumentationProviderDescriptor[];
}

export interface PlatformCatalog {
  readonly platforms: readonly import("./platform-descriptor.model").PlatformDescriptor[];
}

export interface ContractEntry {
  readonly id: string;
  readonly name: string;
  readonly layer: string;
}

export interface DomainEventEntry {
  readonly id: string;
  readonly name: string;
  readonly source: string;
}

export interface DocumentationBundle {
  readonly summary: ArchitectureSummary;
  readonly moduleCatalog: ModuleCatalog;
  readonly dependencyGraph: DependencyGraph;
  readonly publicApiCatalog: PublicApiCatalog;
  readonly providerCatalog: ProviderCatalog;
  readonly platformCatalog: PlatformCatalog;
  readonly contracts: readonly ContractEntry[];
  readonly domainEvents: readonly DomainEventEntry[];
}

export interface ValidationViolation {
  readonly code: string;
  readonly message: string;
  readonly sourceId?: string;
  readonly targetId?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly completedAt: string;
  readonly violations: readonly ValidationViolation[];
}

export interface ArchitectureSnapshot {
  readonly id: string;
  readonly capturedAt: string;
  readonly documentation: DocumentationBundle;
  readonly validation: ValidationResult;
}

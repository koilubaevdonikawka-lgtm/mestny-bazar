import type {
  ArchitectureDependency,
  ArchitectureNode,
  ContractEntry,
  DocumentationProviderDescriptor,
  DomainEventEntry,
  ModuleDescriptor,
  PlatformDescriptor,
} from "@server/platform/documentation/documentation/models";

export interface ModuleApiEntry {
  readonly moduleId: string;
  readonly methods: readonly string[];
}

/** Contract for the architecture registry. */
export interface IArchitectureRegistry {
  registerNode(node: ArchitectureNode): void;
  registerDependency(dependency: ArchitectureDependency): void;
  registerModule(descriptor: ModuleDescriptor): void;
  registerPlatform(descriptor: PlatformDescriptor): void;
  registerProvider(descriptor: DocumentationProviderDescriptor): void;
  registerContract(contract: ContractEntry): void;
  registerDomainEvent(event: DomainEventEntry): void;
  registerModuleApi(entry: ModuleApiEntry): void;
  listNodes(): readonly ArchitectureNode[];
  listDependencies(): readonly ArchitectureDependency[];
  listModules(): readonly ModuleDescriptor[];
  listPlatforms(): readonly PlatformDescriptor[];
  listProviders(): readonly DocumentationProviderDescriptor[];
  listContracts(): readonly ContractEntry[];
  listDomainEvents(): readonly DomainEventEntry[];
  listModuleApis(): readonly ModuleApiEntry[];
}

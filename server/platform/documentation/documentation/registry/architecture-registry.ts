import type {
  IArchitectureRegistry,
  ModuleApiEntry,
} from "@server/platform/documentation/documentation/contracts";
import type {
  ArchitectureDependency,
  ArchitectureNode,
  ContractEntry,
  DocumentationProviderDescriptor,
  DomainEventEntry,
  ModuleDescriptor,
  PlatformDescriptor,
} from "@server/platform/documentation/documentation/models";
import { createArchitectureRegisteredEvent } from "@server/platform/documentation/documentation/events";

/** Central registry for architecture metadata. */
export class ArchitectureRegistry implements IArchitectureRegistry {
  private readonly nodes = new Map<string, ArchitectureNode>();
  private readonly dependencies: ArchitectureDependency[] = [];
  private readonly modules = new Map<string, ModuleDescriptor>();
  private readonly platforms = new Map<string, PlatformDescriptor>();
  private readonly providers = new Map<string, DocumentationProviderDescriptor>();
  private readonly contracts = new Map<string, ContractEntry>();
  private readonly domainEvents = new Map<string, DomainEventEntry>();
  private readonly moduleApis = new Map<string, ModuleApiEntry>();

  registerNode(node: ArchitectureNode): void {
    this.nodes.set(node.id, node);
    createArchitectureRegisteredEvent({ nodeId: node.id, nodeKind: node.kind });
  }

  registerDependency(dependency: ArchitectureDependency): void {
    this.dependencies.push(Object.freeze({ ...dependency }));
  }

  registerModule(descriptor: ModuleDescriptor): void {
    this.modules.set(descriptor.id, descriptor);
    this.registerNode({
      id: descriptor.id,
      name: descriptor.name,
      kind: descriptor.kind,
      layer: descriptor.layer,
      description: `Module API: ${descriptor.moduleApiToken}`,
    });
    this.registerModuleApi({
      moduleId: descriptor.id,
      methods: descriptor.publicMethods,
    });
    for (const dependencyId of descriptor.dependencies) {
      this.registerDependency({
        from: descriptor.id,
        to: dependencyId,
        kind: "uses",
      });
    }
  }

  registerPlatform(descriptor: PlatformDescriptor): void {
    this.platforms.set(descriptor.id, descriptor);
    this.registerNode({
      id: descriptor.id,
      name: descriptor.name,
      kind: "platform-module",
      layer: "platform",
      description: descriptor.path,
    });
    for (const dependencyId of descriptor.dependencies) {
      this.registerDependency({
        from: descriptor.id,
        to: dependencyId,
        kind: "uses",
      });
    }
  }

  registerProvider(descriptor: DocumentationProviderDescriptor): void {
    this.providers.set(descriptor.id, descriptor);
    this.registerNode({
      id: descriptor.id,
      name: descriptor.name,
      kind: "provider-adapter",
      layer: "integration",
      description: `${descriptor.capability} (${descriptor.vendor})`,
    });
  }

  registerContract(contract: ContractEntry): void {
    this.contracts.set(contract.id, contract);
    this.registerNode({
      id: contract.id,
      name: contract.name,
      kind: "contract",
      layer: contract.layer as ArchitectureNode["layer"],
    });
  }

  registerDomainEvent(event: DomainEventEntry): void {
    this.domainEvents.set(event.id, event);
    this.registerNode({
      id: event.id,
      name: event.name,
      kind: "domain-event",
      layer: "application",
      description: event.source,
    });
  }

  registerModuleApi(entry: ModuleApiEntry): void {
    this.moduleApis.set(entry.moduleId, Object.freeze({
      moduleId: entry.moduleId,
      methods: Object.freeze([...entry.methods]),
    }));
  }

  listNodes(): readonly ArchitectureNode[] {
    return Object.freeze([...this.nodes.values()]);
  }

  listDependencies(): readonly ArchitectureDependency[] {
    return Object.freeze([...this.dependencies]);
  }

  listModules(): readonly ModuleDescriptor[] {
    return Object.freeze([...this.modules.values()]);
  }

  listPlatforms(): readonly PlatformDescriptor[] {
    return Object.freeze([...this.platforms.values()]);
  }

  listProviders(): readonly DocumentationProviderDescriptor[] {
    return Object.freeze([...this.providers.values()]);
  }

  listContracts(): readonly ContractEntry[] {
    return Object.freeze([...this.contracts.values()]);
  }

  listDomainEvents(): readonly DomainEventEntry[] {
    return Object.freeze([...this.domainEvents.values()]);
  }

  listModuleApis(): readonly ModuleApiEntry[] {
    return Object.freeze([...this.moduleApis.values()]);
  }
}

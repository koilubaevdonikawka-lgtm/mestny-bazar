import type {
  ArchitectureDependency,
  ArchitectureNode,
  ArchitectureSnapshot,
  ContractEntry,
  DocumentationBundle,
  DocumentationProviderDescriptor,
  DomainEventEntry,
  ModuleDescriptor,
  PlatformDescriptor,
  ValidationResult,
} from "@server/platform/documentation/documentation/models";
import type {
  IArchitectureRegistry,
  IDocumentationGenerator,
  IArchitectureValidator,
} from "@server/platform/documentation/documentation/contracts";
import type { MarkdownExporter } from "@server/platform/documentation/documentation/exporters/markdown.exporter";
import type { JsonExporter } from "@server/platform/documentation/documentation/exporters/json.exporter";
import type { ArchitectureSnapshotExporter } from "@server/platform/documentation/documentation/exporters/architecture-snapshot.exporter";

export interface RegisterArchitectureInput {
  readonly node?: ArchitectureNode;
  readonly dependency?: ArchitectureDependency;
  readonly module?: ModuleDescriptor;
  readonly platform?: PlatformDescriptor;
  readonly provider?: DocumentationProviderDescriptor;
  readonly contract?: ContractEntry;
  readonly domainEvent?: DomainEventEntry;
}

/** Public documentation platform facade. */
export class DocumentationPlatform {
  private lastDocumentation: DocumentationBundle | null = null;
  private lastValidation: ValidationResult | null = null;

  constructor(
    private readonly registry: IArchitectureRegistry,
    private readonly generator: IDocumentationGenerator,
    private readonly validator: IArchitectureValidator,
    private readonly markdownExporter: MarkdownExporter,
    private readonly jsonExporter: JsonExporter,
    private readonly snapshotExporter: ArchitectureSnapshotExporter,
  ) {}

  registerArchitecture(input: RegisterArchitectureInput): void {
    if (input.node) {
      this.registry.registerNode(input.node);
    }
    if (input.dependency) {
      this.registry.registerDependency(input.dependency);
    }
    if (input.module) {
      this.registry.registerModule(input.module);
    }
    if (input.platform) {
      this.registry.registerPlatform(input.platform);
    }
    if (input.provider) {
      this.registry.registerProvider(input.provider);
    }
    if (input.contract) {
      this.registry.registerContract(input.contract);
    }
    if (input.domainEvent) {
      this.registry.registerDomainEvent(input.domainEvent);
    }
  }

  generateDocumentation(): DocumentationBundle {
    this.lastDocumentation = this.generator.generate();
    return this.lastDocumentation;
  }

  validateArchitecture(): ValidationResult {
    this.lastValidation = this.validator.validate();
    return this.lastValidation;
  }

  exportMarkdown(): string {
    const documentation = this.lastDocumentation ?? this.generateDocumentation();
    return this.markdownExporter.export(documentation);
  }

  exportJson(): Record<string, unknown> {
    const documentation = this.lastDocumentation ?? this.generateDocumentation();
    return this.jsonExporter.export(documentation);
  }

  exportSnapshot(): ArchitectureSnapshot {
    const documentation = this.lastDocumentation ?? this.generateDocumentation();
    const validation = this.lastValidation ?? this.validateArchitecture();
    this.lastValidation = validation;
    return this.snapshotExporter.export(documentation);
  }
}

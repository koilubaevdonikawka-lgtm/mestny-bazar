import type { IArchitectureAnalyzer, IGenerator, IInspector, IScaffolder } from "@server/platform/developer/developer/contracts";
import type {
  AnalysisReport,
  DeveloperCommandInput,
  DeveloperCommandOutput,
  GenerationResult,
  InspectionResult,
  ScaffoldResult,
} from "@server/platform/developer/developer/models";
import type { DeveloperCommandRunner } from "@server/platform/developer/developer/commands";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";

/** Public developer platform facade. */
export class DeveloperPlatform {
  constructor(
    private readonly commandRunner: DeveloperCommandRunner,
    private readonly analyzer: IArchitectureAnalyzer,
    private readonly inspectors: readonly IInspector[],
    private readonly generators: readonly IGenerator[],
    private readonly scaffolder: IScaffolder,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
  ) {}

  runCommand(input: DeveloperCommandInput): Promise<DeveloperCommandOutput> {
    return this.commandRunner.run(input);
  }

  analyze(): AnalysisReport {
    return this.analyzer.analyze();
  }

  inspect(target?: string): readonly InspectionResult[] {
    return this.inspectors.map((inspector) => inspector.inspect(target));
  }

  generate(
    target: string,
    options?: Readonly<Record<string, string>>,
  ): GenerationResult {
    const generatorId = options?.generator ?? this.generators[0]?.id;
    const generator = this.generators.find((entry) => entry.id === generatorId);
    if (!generator) {
      throw new Error(`Unknown generator: ${generatorId ?? "none"}`);
    }
    return generator.generate(target, options);
  }

  scaffold(templateId: string, targetName: string): ScaffoldResult {
    return this.scaffolder.scaffold(templateId, targetName);
  }

  async validate(): Promise<{
    readonly architecture: ReturnType<DocumentationPlatform["validateArchitecture"]>;
    readonly policies: Awaited<ReturnType<GovernancePlatform["evaluateAll"]>>;
    readonly passed: boolean;
  }> {
    const architecture = this.documentation.validateArchitecture();
    const policies = await this.governance.evaluateAll();
    return Object.freeze({
      architecture,
      policies,
      passed: architecture.valid && policies.every((result) => result.passed),
    });
  }
}

import type { IArchitectureAnalyzer, IGenerator, IInspector, IScaffolder } from "@server/platform/developer/developer/contracts";
import type {
  DeveloperCommandInput,
  DeveloperCommandOutput,
} from "@server/platform/developer/developer/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Routes developer commands to platform tooling. */
export class DeveloperCommandRunner {
  constructor(
    private readonly analyzer: IArchitectureAnalyzer,
    private readonly inspectors: readonly IInspector[],
    private readonly generators: readonly IGenerator[],
    private readonly scaffolder: IScaffolder,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly testing: TestingPlatform,
    private readonly healthService: IHealthService,
  ) {}

  async run(input: DeveloperCommandInput): Promise<DeveloperCommandOutput> {
    switch (input.command) {
      case "analyze": {
        const report = this.analyzer.analyze();
        return {
          command: input.command,
          success: true,
          message: "Architecture analysis completed.",
          payload: report,
        };
      }
      case "inspect": {
        const results = this.inspectors.map((inspector) => inspector.inspect(input.target));
        const passed = results.every((result) => result.passed);
        return {
          command: input.command,
          success: passed,
          message: passed ? "All inspections passed." : "One or more inspections failed.",
          payload: results,
        };
      }
      case "generate": {
        const target = input.target?.trim();
        if (!target) {
          return {
            command: input.command,
            success: false,
            message: "Generate command requires a target.",
          };
        }
        const generatorId = input.options?.generator ?? this.generators[0]?.id;
        const generator = this.generators.find((entry) => entry.id === generatorId);
        if (!generator) {
          return {
            command: input.command,
            success: false,
            message: `Unknown generator: ${generatorId ?? "none"}`,
          };
        }
        const result = generator.generate(target, input.options);
        return {
          command: input.command,
          success: true,
          message: "Generation completed.",
          payload: result,
        };
      }
      case "validate": {
        const architecture = this.documentation.validateArchitecture();
        const policies = await this.governance.evaluateAll();
        const passed =
          architecture.valid && policies.every((result) => result.passed);
        return {
          command: input.command,
          success: passed,
          message: passed ? "Validation passed." : "Validation failed.",
          payload: { architecture, policies },
        };
      }
      case "scaffold": {
        const templateId = input.options?.template ?? input.target;
        const targetName = input.options?.name ?? input.target;
        if (!templateId || !targetName) {
          return {
            command: input.command,
            success: false,
            message: "Scaffold command requires template and target name.",
          };
        }
        const result = this.scaffolder.scaffold(templateId, targetName);
        return {
          command: input.command,
          success: true,
          message: "Scaffolding completed.",
          payload: result,
        };
      }
      case "report": {
        const health = await this.healthService.check();
        const governanceReport = await this.governance.generateReport();
        const testReport = this.testing.generateReport();
        const analysis = this.analyzer.analyze();
        return {
          command: input.command,
          success: health.status === "healthy",
          message: "Developer report generated.",
          payload: {
            health,
            governanceReport,
            testReport,
            analysis,
          },
        };
      }
      default:
        return {
          command: input.command,
          success: false,
          message: `Unsupported command: ${input.command as string}`,
        };
    }
  }
}

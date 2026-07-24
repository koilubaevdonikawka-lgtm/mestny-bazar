export {
  type AnalysisSection,
  type AnalysisReport,
  createAnalysisReport,
} from "./analysis-report.model";
export {
  type InspectionFinding,
  type InspectionResult,
  createInspectionResult,
} from "./inspection-result.model";
export {
  type GenerationResult,
  createGenerationResult,
} from "./generation-result.model";
export {
  type ScaffoldResult,
  createScaffoldResult,
} from "./scaffold-result.model";

export type DeveloperCommandName =
  | "analyze"
  | "inspect"
  | "generate"
  | "validate"
  | "scaffold"
  | "report";

export interface DeveloperCommandInput {
  readonly command: DeveloperCommandName;
  readonly target?: string;
  readonly options?: Readonly<Record<string, string>>;
}

export interface DeveloperCommandOutput {
  readonly command: DeveloperCommandName;
  readonly success: boolean;
  readonly message: string;
  readonly payload?: unknown;
}

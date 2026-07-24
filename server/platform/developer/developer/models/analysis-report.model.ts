export interface AnalysisSection {
  readonly name: string;
  readonly count: number;
  readonly items: readonly string[];
}

/** Architecture analysis report for developer tooling. */
export interface AnalysisReport {
  readonly id: string;
  readonly generatedAt: string;
  readonly businessCapabilityModules: readonly string[];
  readonly businessProcessModules: readonly string[];
  readonly platformModules: readonly string[];
  readonly infrastructureAdapters: readonly string[];
  readonly dependencyEdges: readonly string[];
  readonly diRegistrations: readonly string[];
  readonly sections: readonly AnalysisSection[];
}

export function createAnalysisReport(input: {
  id?: string;
  businessCapabilityModules: readonly string[];
  businessProcessModules: readonly string[];
  platformModules: readonly string[];
  infrastructureAdapters: readonly string[];
  dependencyEdges: readonly string[];
  diRegistrations: readonly string[];
  sections?: readonly AnalysisSection[];
}): AnalysisReport {
  return Object.freeze({
    id: input.id ?? `analysis-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    businessCapabilityModules: Object.freeze([...input.businessCapabilityModules]),
    businessProcessModules: Object.freeze([...input.businessProcessModules]),
    platformModules: Object.freeze([...input.platformModules]),
    infrastructureAdapters: Object.freeze([...input.infrastructureAdapters]),
    dependencyEdges: Object.freeze([...input.dependencyEdges]),
    diRegistrations: Object.freeze([...input.diRegistrations]),
    sections: Object.freeze([...(input.sections ?? [])]),
  });
}

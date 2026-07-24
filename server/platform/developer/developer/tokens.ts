/** DI tokens for the developer platform. */
export const DeveloperTokens = {
  DeveloperPlatform: Symbol.for("developer.platform"),
  DeveloperCommandRunner: Symbol.for("developer.commandRunner"),
  ArchitectureAnalyzer: Symbol.for("developer.architectureAnalyzer"),
  DependencyInspector: Symbol.for("developer.dependencyInspector"),
  ModuleInspector: Symbol.for("developer.moduleInspector"),
  ProviderInspector: Symbol.for("developer.providerInspector"),
  PlatformInspector: Symbol.for("developer.platformInspector"),
  ModuleGenerator: Symbol.for("developer.moduleGenerator"),
  PlatformGenerator: Symbol.for("developer.platformGenerator"),
  AdapterGenerator: Symbol.for("developer.adapterGenerator"),
  ContractGenerator: Symbol.for("developer.contractGenerator"),
  EventGenerator: Symbol.for("developer.eventGenerator"),
  ScaffoldingEngine: Symbol.for("developer.scaffoldingEngine"),
} as const;

export type DeveloperToken = (typeof DeveloperTokens)[keyof typeof DeveloperTokens];

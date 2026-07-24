import type { ScaffoldResult } from "@server/platform/developer/developer/models";

/** Contract for scaffolding engine. */
export interface IScaffolder {
  scaffold(templateId: string, targetName: string): ScaffoldResult;
  listTemplates(): readonly string[];
}

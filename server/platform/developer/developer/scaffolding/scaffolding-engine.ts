import type { IScaffolder } from "@server/platform/developer/developer/contracts";
import {
  createScaffoldResult,
  type ScaffoldResult,
} from "@server/platform/developer/developer/models";
import { createScaffoldCompletedEvent } from "@server/platform/developer/developer/events";
import { SCAFFOLD_TEMPLATES } from "@server/platform/developer/developer/templates";

/** Scaffolding engine for developer platform templates. */
export class ScaffoldingEngine implements IScaffolder {
  private readonly templates = new Map(
    SCAFFOLD_TEMPLATES.map((template) => [template.id, template]),
  );

  listTemplates(): readonly string[] {
    return Object.freeze([...this.templates.keys()]);
  }

  scaffold(templateId: string, targetName: string): ScaffoldResult {
    const template = this.templates.get(templateId.trim());
    if (!template) {
      throw new Error(`Unknown scaffold template: ${templateId}`);
    }

    const normalizedTarget = targetName.trim();
    if (!normalizedTarget) {
      throw new Error("Scaffold target name is required.");
    }

    const result = createScaffoldResult({
      templateId: template.id,
      targetName: normalizedTarget,
      files: template.render(normalizedTarget),
    });
    createScaffoldCompletedEvent(result);
    return result;
  }
}

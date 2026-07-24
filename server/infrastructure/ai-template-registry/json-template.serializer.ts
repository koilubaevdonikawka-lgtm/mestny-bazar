import type { ITemplateSerializer } from "@server/application/ai-template-registry/contracts/template-serializer.contract";
import {
  createTemplate,
  type Template,
} from "@server/application/ai-template-registry/models/template.model";

/** JSON-based template serializer. */
export class JsonTemplateSerializer implements ITemplateSerializer {
  async serialize(template: Template): Promise<string> {
    return JSON.stringify(template);
  }

  async deserialize(serialized: string): Promise<Template> {
    if (!serialized.trim()) {
      throw new Error("Serialized template cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Template>;
    return createTemplate({
      templateId: parsed.templateId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

import type { Template } from "@server/application/ai-template-registry/models/template.model";

export interface ITemplateSerializer {
  serialize(template: Template): Promise<string>;
  deserialize(serialized: string): Promise<Template>;
}

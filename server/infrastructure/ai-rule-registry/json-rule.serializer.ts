import type { IRuleSerializer } from "@server/application/ai-rule-registry/contracts/rule-serializer.contract";
import {
  createRule,
  type Rule,
} from "@server/application/ai-rule-registry/models/rule.model";

/** JSON-based rule serializer. */
export class JsonRuleSerializer implements IRuleSerializer {
  async serialize(rule: Rule): Promise<string> {
    return JSON.stringify(rule);
  }

  async deserialize(serialized: string): Promise<Rule> {
    if (!serialized.trim()) {
      throw new Error("Serialized rule cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Rule>;
    return createRule({
      ruleId: parsed.ruleId ?? "",
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

import type { ISafetyRuleSerializer } from "@server/application/ai-safety-rule-registry/contracts/safety-rule-serializer.contract";
import {
  createSafetyRule,
  type SafetyRule,
} from "@server/application/ai-safety-rule-registry/models/safety-rule.model";

/** JSON-based safety rule serializer. */
export class JsonSafetyRuleSerializer implements ISafetyRuleSerializer {
  async serialize(safetyRule: SafetyRule): Promise<string> {
    return JSON.stringify(safetyRule);
  }

  async deserialize(serialized: string): Promise<SafetyRule> {
    if (!serialized.trim()) {
      throw new Error("Serialized safety rule cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<SafetyRule>;
    return createSafetyRule({
      safetyRuleId: parsed.safetyRuleId ?? "",
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

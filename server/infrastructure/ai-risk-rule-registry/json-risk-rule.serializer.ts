import type { IRiskRuleSerializer } from "@server/application/ai-risk-rule-registry/contracts/risk-rule-serializer.contract";
import {
  createRiskRule,
  type RiskRule,
} from "@server/application/ai-risk-rule-registry/models/risk-rule.model";

/** JSON-based risk rule serializer. */
export class JsonRiskRuleSerializer implements IRiskRuleSerializer {
  async serialize(riskRule: RiskRule): Promise<string> {
    return JSON.stringify(riskRule);
  }

  async deserialize(serialized: string): Promise<RiskRule> {
    if (!serialized.trim()) {
      throw new Error("Serialized risk rule cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<RiskRule>;
    return createRiskRule({
      riskRuleId: parsed.riskRuleId ?? "",
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

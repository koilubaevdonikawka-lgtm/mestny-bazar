import type { IStrategySerializer } from "@server/application/ai-strategy-registry/contracts/strategy-serializer.contract";
import {
  createStrategy,
  type Strategy,
} from "@server/application/ai-strategy-registry/models/strategy.model";

/** JSON-based strategy serializer. */
export class JsonStrategySerializer implements IStrategySerializer {
  async serialize(strategy: Strategy): Promise<string> {
    return JSON.stringify(strategy);
  }

  async deserialize(serialized: string): Promise<Strategy> {
    if (!serialized.trim()) {
      throw new Error("Serialized strategy cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Strategy>;
    return createStrategy({
      strategyId: parsed.strategyId ?? "",
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

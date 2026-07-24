import type { IDecisionRegistry } from "@server/platform/decision/decision/contracts";
import {
  createDecisionDescriptor,
  type DecisionDescriptor,
  type DecisionKind,
  type DecisionResult,
} from "@server/platform/decision/decision/models";

/** Central registry for platform decisions. */
export class DecisionRegistry implements IDecisionRegistry {
  private readonly descriptors = new Map<string, DecisionDescriptor>();
  private readonly results = new Map<string, DecisionResult>();

  register(descriptor: DecisionDescriptor): DecisionDescriptor {
    const stored = createDecisionDescriptor(descriptor);
    this.descriptors.set(stored.id, stored);
    return stored;
  }

  storeResult(result: DecisionResult): DecisionResult {
    this.results.set(result.id, result);
    this.descriptors.set(result.descriptor.id, result.descriptor);
    return result;
  }

  getResult(decisionId: string): DecisionResult | undefined {
    return this.results.get(decisionId.trim());
  }

  listResults(kind?: DecisionKind): readonly DecisionResult[] {
    const values = [...this.results.values()];
    const filtered = kind ? values.filter((result) => result.descriptor.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}

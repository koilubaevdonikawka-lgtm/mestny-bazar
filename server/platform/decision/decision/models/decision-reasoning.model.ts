/** Decision reasoning trace metadata. */
export interface DecisionReasoning {
  readonly id: string;
  readonly decisionId: string;
  readonly trace: readonly string[];
  readonly explanation: string;
  readonly appliedRules: readonly string[];
  readonly generatedAt: string;
}

export function createDecisionReasoning(input: {
  id?: string;
  decisionId: string;
  trace?: readonly string[];
  explanation?: string;
  appliedRules?: readonly string[];
}): DecisionReasoning {
  return Object.freeze({
    id: input.id ?? `reasoning-${Date.now()}`,
    decisionId: input.decisionId.trim(),
    trace: Object.freeze([...(input.trace ?? [])]),
    explanation: input.explanation?.trim() ?? "",
    appliedRules: Object.freeze([...(input.appliedRules ?? [])]),
    generatedAt: new Date().toISOString(),
  });
}

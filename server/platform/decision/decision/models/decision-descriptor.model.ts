export type DecisionKind =
  | "architecture"
  | "platform"
  | "provider"
  | "lifecycle"
  | "operational";

export type DecisionStrategyKind =
  | "conservative"
  | "balanced"
  | "aggressive"
  | "experimental";

/** Decision request descriptor metadata. */
export interface DecisionDescriptor {
  readonly id: string;
  readonly kind: DecisionKind;
  readonly subject: string;
  readonly strategy: DecisionStrategyKind;
  readonly context: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export function createDecisionDescriptor(input: {
  id?: string;
  kind: DecisionKind;
  subject: string;
  strategy?: DecisionStrategyKind;
  context?: Readonly<Record<string, unknown>>;
}): DecisionDescriptor {
  return Object.freeze({
    id: input.id ?? `decision-${Date.now()}`,
    kind: input.kind,
    subject: input.subject.trim(),
    strategy: input.strategy ?? "balanced",
    context: Object.freeze({ ...(input.context ?? {}) }),
    createdAt: new Date().toISOString(),
  });
}

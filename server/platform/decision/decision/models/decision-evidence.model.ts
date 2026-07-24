/** Evidence item supporting a decision. */
export interface DecisionEvidence {
  readonly id: string;
  readonly source: string;
  readonly label: string;
  readonly value: string;
  readonly weight: number;
}

export function createDecisionEvidence(input: {
  id?: string;
  source: string;
  label: string;
  value: string;
  weight?: number;
}): DecisionEvidence {
  return Object.freeze({
    id: input.id ?? `evidence-${Date.now()}`,
    source: input.source.trim(),
    label: input.label.trim(),
    value: input.value.trim(),
    weight: input.weight ?? 1,
  });
}

export type ChangelogCategory =
  | "architecture"
  | "governance"
  | "testing"
  | "documentation"
  | "operations";

/** Single changelog entry for a release. */
export interface ChangelogEntry {
  readonly id: string;
  readonly category: ChangelogCategory;
  readonly summary: string;
  readonly details?: string;
}

export function createChangelogEntry(input: {
  id?: string;
  category: ChangelogCategory;
  summary: string;
  details?: string;
}): ChangelogEntry {
  return Object.freeze({
    id: input.id ?? `changelog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: input.category,
    summary: input.summary.trim(),
    details: input.details?.trim() || undefined,
  });
}

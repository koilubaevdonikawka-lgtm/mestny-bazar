import type { ISnapshotComparisonEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import type { ISnapshotEngine } from "@server/platform/digital-twin/digital-twin/contracts";
import {
  createSnapshotComparison,
  type ComparisonKind,
  type SnapshotComparison,
} from "@server/platform/digital-twin/digital-twin/models";
import { createSnapshotComparedEvent } from "@server/platform/digital-twin/digital-twin/events";

/** Compares snapshots and produces diff metadata. */
export class SnapshotComparisonEngine implements ISnapshotComparisonEngine {
  constructor(private readonly snapshotEngine: ISnapshotEngine) {}

  compare(
    sourceSnapshotId: string,
    targetSnapshotId: string,
    kind: ComparisonKind = "snapshot",
  ): SnapshotComparison {
    const source = this.snapshotEngine.load(sourceSnapshotId);
    const target = this.snapshotEngine.load(targetSnapshotId);
    const diff = this.diffPayloads(source?.payload ?? {}, target?.payload ?? {}, kind);
    const comparison = createSnapshotComparison({
      kind,
      sourceSnapshotId,
      targetSnapshotId,
      added: diff.added,
      removed: diff.removed,
      changed: diff.changed,
      metadata: Object.freeze({
        sourceKind: source?.kind,
        targetKind: target?.kind,
      }),
    });
    createSnapshotComparedEvent(comparison);
    return comparison;
  }

  private diffPayloads(
    source: Readonly<Record<string, unknown>>,
    target: Readonly<Record<string, unknown>>,
    kind: ComparisonKind,
  ): { added: string[]; removed: string[]; changed: string[] } {
    const sourceKeys = new Set(Object.keys(source));
    const targetKeys = new Set(Object.keys(target));
    const added = [...targetKeys].filter((key) => !sourceKeys.has(key));
    const removed = [...sourceKeys].filter((key) => !targetKeys.has(key));
    const changed = [...sourceKeys].filter(
      (key) => targetKeys.has(key) && JSON.stringify(source[key]) !== JSON.stringify(target[key]),
    );

    if (kind === "capability") {
      return {
        added: this.diffArrays(source.capabilities, target.capabilities).added,
        removed: this.diffArrays(source.capabilities, target.capabilities).removed,
        changed,
      };
    }
    if (kind === "dependency") {
      return {
        added: this.diffArrays(source.relations, target.relations).added,
        removed: this.diffArrays(source.relations, target.relations).removed,
        changed,
      };
    }
    if (kind === "knowledge") {
      return {
        added: this.diffArrays(source.nodes, target.nodes).added,
        removed: this.diffArrays(source.nodes, target.nodes).removed,
        changed,
      };
    }

    return { added, removed, changed };
  }

  private diffArrays(
    sourceValue: unknown,
    targetValue: unknown,
  ): { added: string[]; removed: string[] } {
    const source = Array.isArray(sourceValue) ? sourceValue.map(String) : [];
    const target = Array.isArray(targetValue) ? targetValue.map(String) : [];
    const sourceSet = new Set(source);
    const targetSet = new Set(target);
    return {
      added: target.filter((item) => !sourceSet.has(item)),
      removed: source.filter((item) => !targetSet.has(item)),
    };
  }
}

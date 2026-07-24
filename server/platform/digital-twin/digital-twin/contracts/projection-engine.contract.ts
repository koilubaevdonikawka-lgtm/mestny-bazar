import type {
  ProjectionKind,
  ProjectionResult,
} from "@server/platform/digital-twin/digital-twin/models";

/** Contract for future state projection. */
export interface IProjectionEngine {
  generate(snapshotId: string, kind: ProjectionKind): ProjectionResult;
}

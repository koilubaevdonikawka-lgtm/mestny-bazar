import type { RestoreDescriptor } from "@server/platform/operations/operations/models";

/** Contract for platform restore operations. */
export interface IRestoreService {
  restore(backupId: string): Promise<RestoreDescriptor> | RestoreDescriptor;
}

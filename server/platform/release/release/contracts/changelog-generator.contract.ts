import type { ChangelogEntry } from "@server/platform/release/release/models";

/** Contract for automatic changelog generation. */
export interface IChangelogGenerator {
  generate(): Promise<readonly ChangelogEntry[]> | readonly ChangelogEntry[];
}

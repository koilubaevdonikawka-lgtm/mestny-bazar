import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** Future integration point for command version management. Not wired yet. */
export interface ICommandVersionProvider {
  listVersions(commandId: string): Promise<readonly Command[]>;
  getVersion(commandId: string, version: string): Promise<Command | null>;
}

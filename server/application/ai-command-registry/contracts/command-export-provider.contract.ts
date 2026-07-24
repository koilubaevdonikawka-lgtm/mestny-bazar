import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** Future integration point for command export. Not wired yet. */
export interface ICommandExportProvider {
  exportTo(commands: readonly Command[]): Promise<string>;
}

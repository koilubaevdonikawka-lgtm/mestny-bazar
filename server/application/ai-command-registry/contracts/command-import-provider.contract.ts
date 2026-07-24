import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** Future integration point for command import. Not wired yet. */
export interface ICommandImportProvider {
  importFrom(source: string): Promise<readonly Command[]>;
}

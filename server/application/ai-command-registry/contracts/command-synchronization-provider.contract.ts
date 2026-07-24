import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** Future integration point for command synchronization. Not wired yet. */
export interface ICommandSynchronizationProvider {
  synchronize(commands: readonly Command[]): Promise<void>;
}

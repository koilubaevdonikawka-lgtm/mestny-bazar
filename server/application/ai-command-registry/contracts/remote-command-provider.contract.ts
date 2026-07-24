import type { Command } from "@server/application/ai-command-registry/models/command.model";

/** Future integration point for external command providers. Not wired yet. */
export interface IRemoteCommandProvider {
  fetchRemote(commandId: string): Promise<Command | null>;
  pushRemote(command: Command): Promise<void>;
}

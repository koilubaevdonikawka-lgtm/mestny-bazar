import type { DeveloperCommandInput, DeveloperCommandOutput } from "@server/platform/developer/developer/models";

/** Contract for developer CLI-style commands. */
export interface IDeveloperCommand {
  readonly name: DeveloperCommandInput["command"];
  execute(input: DeveloperCommandInput): Promise<DeveloperCommandOutput> | DeveloperCommandOutput;
}

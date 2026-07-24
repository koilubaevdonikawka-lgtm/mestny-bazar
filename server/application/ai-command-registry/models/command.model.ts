/** Registered AI command — generic command metadata only, no domain knowledge. */
export interface Command {
  readonly commandId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterCommandInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateCommandInput {
  readonly commandId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListCommandsResult {
  readonly commands: readonly Command[];
  readonly total: number;
}

export interface FindCommandByNameResult {
  readonly command: Command | null;
}

export interface ListCommandsByCategoryResult {
  readonly commands: readonly Command[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteCommandResult {
  readonly commandId: string;
  readonly deleted: boolean;
}

export interface CommandRegistryStatistics {
  readonly totalCommands: number;
  readonly activeCommands: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createCommand(input: {
  commandId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Command {
  const now = new Date().toISOString();
  return Object.freeze({
    commandId: input.commandId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

import type { Context } from "@server/application/ai-context-management/models/context.model";

export interface IContextSerializer {
  serialize(context: Context): Promise<string>;
  deserialize(serialized: string): Promise<Context>;
}

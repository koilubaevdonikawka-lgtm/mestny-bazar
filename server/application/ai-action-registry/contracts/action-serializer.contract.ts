import type { Action } from "@server/application/ai-action-registry/models/action.model";

export interface IActionSerializer {
  serialize(action: Action): Promise<string>;
  deserialize(serialized: string): Promise<Action>;
}

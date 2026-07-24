import type { Action } from "@server/application/ai-action-registry/models/action.model";

export interface IActionCatalog {
  register(action: Action): Promise<void>;
  remove(actionId: string): Promise<void>;
  findById(actionId: string): Promise<Action | null>;
  findByName(name: string): Promise<Action | null>;
  findByCategory(category: string): Promise<readonly Action[]>;
  listAll(): Promise<readonly Action[]>;
}

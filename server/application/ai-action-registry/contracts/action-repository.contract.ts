import type { Action } from "@server/application/ai-action-registry/models/action.model";

export interface IActionRepository {
  save(action: Action): Promise<void>;
  findById(actionId: string): Promise<Action | null>;
  findByName(name: string): Promise<Action | null>;
  findByCategory(category: string): Promise<readonly Action[]>;
  findAll(): Promise<readonly Action[]>;
  delete(actionId: string): Promise<boolean>;
}

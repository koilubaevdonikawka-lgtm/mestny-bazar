import type { Context } from "@server/application/ai-context-management/models/context.model";

export interface IContextRepository {
  save(context: Context): Promise<void>;
  findById(contextId: string): Promise<Context | null>;
  findByName(name: string): Promise<Context | null>;
  findByCategory(category: string): Promise<readonly Context[]>;
  findAll(): Promise<readonly Context[]>;
  delete(contextId: string): Promise<boolean>;
}

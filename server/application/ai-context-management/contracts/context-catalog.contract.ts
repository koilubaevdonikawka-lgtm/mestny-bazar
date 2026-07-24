import type { Context } from "@server/application/ai-context-management/models/context.model";

export interface IContextCatalog {
  register(context: Context): Promise<void>;
  remove(contextId: string): Promise<void>;
  findById(contextId: string): Promise<Context | null>;
  findByName(name: string): Promise<Context | null>;
  findByCategory(category: string): Promise<readonly Context[]>;
  listAll(): Promise<readonly Context[]>;
}

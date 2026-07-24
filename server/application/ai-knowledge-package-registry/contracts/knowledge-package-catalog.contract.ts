import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

export interface IKnowledgePackageCatalog {
  register(knowledgePackage: KnowledgePackage): Promise<void>;
  remove(knowledgePackageId: string): Promise<void>;
  findById(knowledgePackageId: string): Promise<KnowledgePackage | null>;
  findByName(name: string): Promise<KnowledgePackage | null>;
  findByCategory(category: string): Promise<readonly KnowledgePackage[]>;
  listAll(): Promise<readonly KnowledgePackage[]>;
}

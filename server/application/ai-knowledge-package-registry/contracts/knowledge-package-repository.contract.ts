import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

export interface IKnowledgePackageRepository {
  save(knowledgePackage: KnowledgePackage): Promise<void>;
  findById(knowledgePackageId: string): Promise<KnowledgePackage | null>;
  findByName(name: string): Promise<KnowledgePackage | null>;
  findByCategory(category: string): Promise<readonly KnowledgePackage[]>;
  findAll(): Promise<readonly KnowledgePackage[]>;
  delete(knowledgePackageId: string): Promise<boolean>;
}

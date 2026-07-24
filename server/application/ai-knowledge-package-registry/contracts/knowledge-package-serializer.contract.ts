import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

export interface IKnowledgePackageSerializer {
  serialize(knowledgePackage: KnowledgePackage): Promise<string>;
  deserialize(serialized: string): Promise<KnowledgePackage>;
}

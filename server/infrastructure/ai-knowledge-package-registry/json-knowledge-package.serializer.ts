import type { IKnowledgePackageSerializer } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-serializer.contract";
import {
  createKnowledgePackage,
  type KnowledgePackage,
} from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** JSON-based knowledge package serializer. */
export class JsonKnowledgePackageSerializer implements IKnowledgePackageSerializer {
  async serialize(knowledgePackage: KnowledgePackage): Promise<string> {
    return JSON.stringify(knowledgePackage);
  }

  async deserialize(serialized: string): Promise<KnowledgePackage> {
    if (!serialized.trim()) {
      throw new Error("Serialized knowledge package cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<KnowledgePackage>;
    return createKnowledgePackage({
      knowledgePackageId: parsed.knowledgePackageId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}

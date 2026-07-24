import type { ISkillSerializer } from "@server/application/ai-skill-registry/contracts/skill-serializer.contract";
import {
  createSkill,
  type Skill,
} from "@server/application/ai-skill-registry/models/skill.model";

/** JSON-based skill serializer. */
export class JsonSkillSerializer implements ISkillSerializer {
  async serialize(skill: Skill): Promise<string> {
    return JSON.stringify(skill);
  }

  async deserialize(serialized: string): Promise<Skill> {
    if (!serialized.trim()) {
      throw new Error("Serialized skill cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Skill>;
    return createSkill({
      skillId: parsed.skillId ?? "",
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

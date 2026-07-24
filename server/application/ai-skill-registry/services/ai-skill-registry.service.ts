/**
 * AI Skill Registry — unified registry for AI skills.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ISkillCatalog } from "@server/application/ai-skill-registry/contracts/skill-catalog.contract";
import type { ISkillRepository } from "@server/application/ai-skill-registry/contracts/skill-repository.contract";
import type { ISkillSerializer } from "@server/application/ai-skill-registry/contracts/skill-serializer.contract";
import type { ISkillStatisticsProvider } from "@server/application/ai-skill-registry/contracts/skill-statistics-provider.contract";
import type { ISkillValidator } from "@server/application/ai-skill-registry/contracts/skill-validator.contract";
import {
  createSkill,
  type DeleteSkillResult,
  type FindSkillByNameResult,
  type ListSkillsByCategoryResult,
  type ListSkillsResult,
  type RegisterSkillInput,
  type Skill,
  type SkillRegistryStatistics,
  type UpdateSkillInput,
} from "@server/application/ai-skill-registry/models/skill.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiSkillRegistryService {
  constructor(
    private readonly skillRepository: ISkillRepository,
    private readonly skillCatalog: ISkillCatalog,
    private readonly skillValidator: ISkillValidator,
    private readonly skillSerializer: ISkillSerializer,
    private readonly statisticsProvider: ISkillStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSkill(input: RegisterSkillInput): Promise<Skill> {
    const validation = await this.skillValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.skillRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Skill already exists with name: ${input.name.trim()}`);
    }

    const skill = createSkill({
      skillId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.skillRepository.save(skill);
    await this.skillCatalog.register(skill);
    return skill;
  }

  async getSkill(skillId: string): Promise<Skill | null> {
    return this.skillRepository.findById(skillId.trim());
  }

  async listSkills(): Promise<ListSkillsResult> {
    const skills = Object.freeze(
      [...(await this.skillRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ skills, total: skills.length });
  }

  async updateSkill(input: UpdateSkillInput): Promise<Skill> {
    const skillId = input.skillId.trim();
    const existing = await this.skillRepository.findById(skillId);
    if (!existing) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    const validation = await this.skillValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.skillRepository.findByName(input.name.trim());
      if (duplicate && duplicate.skillId !== existing.skillId) {
        throw new Error(`Skill already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createSkill({
      skillId: existing.skillId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.skillRepository.save(updated);
    await this.skillCatalog.register(updated);
    return updated;
  }

  async deleteSkill(skillId: string): Promise<DeleteSkillResult> {
    const normalizedSkillId = skillId.trim();
    const deleted = await this.skillRepository.delete(normalizedSkillId);
    if (deleted) {
      await this.skillCatalog.remove(normalizedSkillId);
    }
    return Object.freeze({ skillId: normalizedSkillId, deleted });
  }

  async findSkillByName(name: string): Promise<FindSkillByNameResult> {
    const normalizedName = name.trim();
    const skill = await this.skillRepository.findByName(normalizedName);
    return Object.freeze({ skill });
  }

  async listSkillsByCategory(category: string): Promise<ListSkillsByCategoryResult> {
    const normalizedCategory = category.trim();
    const skills = Object.freeze(
      [...(await this.skillRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      skills,
      total: skills.length,
      category: normalizedCategory,
    });
  }

  async getSkillRegistryStatistics(): Promise<SkillRegistryStatistics> {
    const skills = await this.skillRepository.findAll();
    const activeSkills = skills.filter((skill) => skill.status === "active").length;
    const categories = Object.freeze([
      ...new Set(skills.map((skill) => skill.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalSkills: skills.length,
      activeSkills,
      categories,
    });
  }

  async serializeSkill(skill: Skill): Promise<string> {
    return this.skillSerializer.serialize(skill);
  }

  async deserializeSkill(serialized: string): Promise<Skill> {
    return this.skillSerializer.deserialize(serialized);
  }
}

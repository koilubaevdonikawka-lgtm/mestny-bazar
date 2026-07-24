import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiSkillRegistryApplicationService } from "@server/application/ai-skill-registry/services/ai-skill-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Skill Registry HTTP controller — skill management only. */
export class AiSkillRegistryController {
  constructor(private readonly skillRegistry: AiSkillRegistryApplicationService) {}

  async registerSkill(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.skillRegistry.registerSkill({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listSkills(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.skillRegistry.listSkills();
    return createJsonResponse(context, result.value);
  }

  async getSkill(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const skillId = this.requireSkillId(context);
    const result = await this.skillRegistry.getSkill(skillId);
    if (!result.value) {
      throw new ApiValidationError({
        skillId: [`Skill not found: ${skillId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateSkill(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const skillId = this.requireSkillId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.skillRegistry.updateSkill({
      skillId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeSkill(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const skillId = this.requireSkillId(context);
    const result = await this.skillRegistry.deleteSkill(skillId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.skillRegistry.findSkillByName(name);
    if (!result.value.skill) {
      throw new ApiValidationError({ name: [`Skill not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.skillRegistry.listSkillsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.skillRegistry.getSkillRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireSkillId(context: ApiRequestContext): string {
    const skillId = readString(context.params.skillId);
    if (!skillId) {
      throw new ApiValidationError({ skillId: ["skillId is required"] });
    }
    return skillId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}

import type { AiSkillRegistryController } from "@server/api/modules/ai-skill-registry/ai-skill-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiSkillRegistryRoutes(
  controller: AiSkillRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/skills/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/skills/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/skills/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/skills/:skillId",
      handler: (context) => controller.getSkill(context),
    },
    {
      method: "PUT",
      path: "/api/ai/skills/:skillId",
      handler: (context) => controller.updateSkill(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/skills/:skillId",
      handler: (context) => controller.removeSkill(context),
    },
    {
      method: "GET",
      path: "/api/ai/skills",
      handler: (context) => controller.listSkills(context),
    },
    {
      method: "POST",
      path: "/api/ai/skills",
      handler: (context) => controller.registerSkill(context),
    },
  ];
}

import type { AiVocabularyRegistryController } from "@server/api/modules/ai-vocabulary-registry/ai-vocabulary-registry.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createAiVocabularyRegistryRoutes(
  controller: AiVocabularyRegistryController,
): ApiRouteDefinition[] {
  return [
    {
      method: "GET",
      path: "/api/ai/vocabularies/statistics",
      handler: (context) => controller.statistics(context),
    },
    {
      method: "GET",
      path: "/api/ai/vocabularies/name/:name",
      handler: (context) => controller.findByName(context),
    },
    {
      method: "GET",
      path: "/api/ai/vocabularies/category/:category",
      handler: (context) => controller.listByCategory(context),
    },
    {
      method: "GET",
      path: "/api/ai/vocabularies/:vocabularyId",
      handler: (context) => controller.getVocabulary(context),
    },
    {
      method: "PUT",
      path: "/api/ai/vocabularies/:vocabularyId",
      handler: (context) => controller.updateVocabulary(context),
    },
    {
      method: "DELETE",
      path: "/api/ai/vocabularies/:vocabularyId",
      handler: (context) => controller.removeVocabulary(context),
    },
    {
      method: "GET",
      path: "/api/ai/vocabularies",
      handler: (context) => controller.listVocabularies(context),
    },
    {
      method: "POST",
      path: "/api/ai/vocabularies",
      handler: (context) => controller.registerVocabulary(context),
    },
  ];
}

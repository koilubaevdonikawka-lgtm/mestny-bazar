import type { StorageController } from "@server/api/integration/storage/storage.controller";
import type { ApiRouteDefinition } from "@server/api/server/api.types";

export function createStorageRoutes(controller: StorageController): ApiRouteDefinition[] {
  return [
    {
      method: "POST",
      path: "/api/storage/upload",
      handler: (context) => controller.upload(context),
    },
    {
      method: "GET",
      path: "/api/storage/:key",
      handler: (context) => controller.download(context),
    },
    {
      method: "DELETE",
      path: "/api/storage/:key",
      handler: (context) => controller.delete(context),
    },
  ];
}

export { ErrorMiddleware } from "./error.middleware";
export { RequestIdMiddleware } from "./request-id.middleware";
export { LoggingMiddleware } from "./logging.middleware";

import { ErrorMiddleware } from "./error.middleware";
import { LoggingMiddleware } from "./logging.middleware";
import { RequestIdMiddleware } from "./request-id.middleware";
import type { ApiLogger, ApiMiddlewareHandler } from "@server/api/server/api.types";

/** Registers the default middleware pipeline (error → request id → logging). */
export function createDefaultMiddlewares(logger: ApiLogger): ApiMiddlewareHandler[] {
  return [
    new ErrorMiddleware().handle(),
    new RequestIdMiddleware().handle(),
    new LoggingMiddleware(logger).handle(),
  ];
}

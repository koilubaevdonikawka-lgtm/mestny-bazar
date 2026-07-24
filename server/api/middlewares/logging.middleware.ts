import type { ApiLogger, ApiMiddlewareHandler } from "@server/api/server/api.types";

/** Logs incoming requests and outgoing responses. */
export class LoggingMiddleware {
  constructor(private readonly logger: ApiLogger) {}

  handle(): ApiMiddlewareHandler {
    return async (context, next) => {
      const startedAt = Date.now();
      this.logger.info("api.request.received", {
        requestId: context.requestId,
        method: context.method,
        path: context.path,
      });

      const response = await next(context);

      this.logger.info("api.request.completed", {
        requestId: context.requestId,
        method: context.method,
        path: context.path,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });

      return response;
    };
  }
}

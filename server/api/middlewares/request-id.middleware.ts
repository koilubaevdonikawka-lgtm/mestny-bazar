import type { ApiMiddlewareHandler, ApiRequestContext } from "@server/api/server/api.types";

/** Assigns a unique request identifier to each request context. */
export class RequestIdMiddleware {
  constructor(private readonly idFactory: () => string = defaultRequestIdFactory) {}

  handle(): ApiMiddlewareHandler {
    return async (context, next) => {
      const enriched: ApiRequestContext = Object.freeze({
        ...context,
        requestId: context.requestId ?? this.idFactory(),
      });

      const response = await next(enriched);
      return Object.freeze({
        ...response,
        headers: Object.freeze({
          ...response.headers,
          "x-request-id": enriched.requestId ?? "",
        }),
      });
    };
  }
}

function defaultRequestIdFactory(): string {
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

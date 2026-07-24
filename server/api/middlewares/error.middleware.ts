import { ApiErrorMapper } from "@server/api/errors";
import { createErrorResponse } from "@server/api/responses";
import type {
  ApiMiddlewareHandler,
  ApiRequestContext,
  ApiResponseEnvelope,
} from "@server/api/server/api.types";

/** Catches errors and maps them to RFC 9457-like responses. */
export class ErrorMiddleware {
  constructor(private readonly mapper = new ApiErrorMapper()) {}

  handle(): ApiMiddlewareHandler {
    return async (context, next) => {
      try {
        return await next(context);
      } catch (error) {
        const problem = this.mapper.map(error, `${context.method} ${context.path}`);
        const body = createErrorResponse(problem, { requestId: context.requestId });

        return Object.freeze({
          status: problem.status,
          headers: Object.freeze({
            "content-type": "application/problem+json",
          }),
          body,
        });
      }
    };
  }
}

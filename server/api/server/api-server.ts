import { ApiNotFoundError } from "@server/api/errors/api.errors";
import { createErrorResponse } from "@server/api/responses";
import { matchRoute } from "@server/api/server/route-matcher";
import type {
  ApiMiddlewareHandler,
  ApiRequestContext,
  ApiResponseEnvelope,
  ApiRouteDefinition,
  ApiLogger,
} from "@server/api/server/api.types";
import { ConsoleApiLogger } from "@server/api/server/console-api-logger";

export interface ApiServerOptions {
  logger?: ApiLogger;
}

/**
 * Framework-agnostic API server.
 * Dispatches requests through middleware and route handlers without binding to HTTP transport.
 */
export class ApiServer {
  private readonly routes: ApiRouteDefinition[] = [];
  private readonly middlewares: ApiMiddlewareHandler[] = [];
  private readonly logger: ApiLogger;
  private running = false;

  constructor(options: ApiServerOptions = {}) {
    this.logger = options.logger ?? new ConsoleApiLogger();
  }

  registerRoutes(routes: readonly ApiRouteDefinition[]): this {
    this.routes.push(...routes);
    return this;
  }

  registerMiddlewares(middlewares: readonly ApiMiddlewareHandler[]): this {
    this.middlewares.push(...middlewares);
    return this;
  }

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    this.logger.info("api.server.started", {
      routeCount: this.routes.length,
      middlewareCount: this.middlewares.length,
    });
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;
    this.logger.info("api.server.stopped");
  }

  isRunning(): boolean {
    return this.running;
  }

  async handle(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const matched = matchRoute(this.routes, context.method, context.path);
    if (!matched) {
      return this.createNotFoundResponse(context);
    }

    const requestContext: ApiRequestContext = Object.freeze({
      ...context,
      params: Object.freeze({
        ...context.params,
        ...matched.params,
      }),
    });

    return this.runMiddlewarePipeline(requestContext, matched.handler);
  }

  private async runMiddlewarePipeline(
    context: ApiRequestContext,
    routeHandler: (context: ApiRequestContext) => Promise<ApiResponseEnvelope>,
  ): Promise<ApiResponseEnvelope> {
    const dispatch = (
      index: number,
      currentContext: ApiRequestContext,
    ): Promise<ApiResponseEnvelope> => {
      if (index >= this.middlewares.length) {
        return routeHandler(currentContext);
      }

      const middleware = this.middlewares[index];
      return middleware(currentContext, (nextContext) => dispatch(index + 1, nextContext));
    };

    return dispatch(0, context);
  }

  private createNotFoundResponse(context: ApiRequestContext): ApiResponseEnvelope {
    const error = new ApiNotFoundError("Route", `Route not found: ${context.method} ${context.path}`);
    const problem = {
      type: "application:not_found",
      title: "Resource not found",
      status: 404,
      detail: error.message,
      instance: `${context.method} ${context.path}`,
      code: "NOT_FOUND",
    };

    return Object.freeze({
      status: 404,
      headers: Object.freeze({
        "content-type": "application/problem+json",
      }),
      body: createErrorResponse(problem, { requestId: context.requestId }),
    });
  }
}

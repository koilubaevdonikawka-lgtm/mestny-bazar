import { createErrorResponse, createProblemDetails } from "@server/api/responses";
import type { ApiLogger } from "@server/api/server/api.types";
import type { ExpressRequestWithMetadata } from "@server/transports/http/mapping/express-request.mapper";
import type { CorsOptions } from "@server/transports/http/server/http-server-options";
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";

/** Adapts transport-level Express middleware (request id, logging, error). */
export class ExpressMiddlewareAdapter {
  constructor(private readonly logger?: ApiLogger) {}

  requestId(): RequestHandler {
    return (request: ExpressRequestWithMetadata, response: Response, next: NextFunction) => {
      const incoming = request.header("x-request-id");
      const requestId = incoming?.trim() || createTransportRequestId();

      request.marketplace = {
        ...(request.marketplace ?? {}),
        requestId,
      };

      response.setHeader("x-request-id", requestId);
      next();
    };
  }

  logging(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      if (!this.logger) {
        next();
        return;
      }

      const startedAt = Date.now();
      this.logger.info("http.transport.request.received", {
        method: request.method,
        path: request.originalUrl,
      });

      response.on("finish", () => {
        this.logger?.info("http.transport.request.completed", {
          method: request.method,
          path: request.originalUrl,
          status: response.statusCode,
          durationMs: Date.now() - startedAt,
        });
      });

      next();
    };
  }

  error(): ErrorRequestHandler {
    return (
      error: unknown,
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      if (response.headersSent) {
        next(error);
        return;
      }

      const detail = error instanceof Error ? error.message : "Unexpected transport error";
      const problem = createProblemDetails({
        type: "transport:error",
        title: "Transport error",
        status: 500,
        detail,
        instance: `${request.method} ${request.originalUrl}`,
        code: "TRANSPORT_ERROR",
      });

      response.status(500);
      response.setHeader("content-type", "application/problem+json");
      response.json(createErrorResponse(problem));
    };
  }

  apply(app: {
    use: (...handlers: Array<RequestHandler | ErrorRequestHandler>) => unknown;
  }): void {
    app.use(this.requestId());
    app.use(this.logging());
  }

  applyErrorHandler(app: {
    use: (...handlers: Array<RequestHandler | ErrorRequestHandler>) => unknown;
  }): void {
    app.use(this.error());
  }
}

export function createCorsMiddleware(options: CorsOptions): RequestHandler {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!options.enabled) {
      next();
      return;
    }

    response.setHeader("Access-Control-Allow-Origin", options.origin ?? "*");
    response.setHeader(
      "Access-Control-Allow-Methods",
      (options.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]).join(", "),
    );
    response.setHeader(
      "Access-Control-Allow-Headers",
      (options.allowedHeaders ?? ["Content-Type", "Authorization", "X-Request-Id"]).join(", "),
    );

    if (options.credentials) {
      response.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (request.method === "OPTIONS") {
      response.sendStatus(204);
      return;
    }

    next();
  };
}

export function createCompressionMiddleware(enabled: boolean): RequestHandler {
  return (_request: Request, response: Response, next: NextFunction) => {
    if (!enabled) {
      next();
      return;
    }

    const acceptEncoding = response.req.headers["accept-encoding"] ?? "";
    if (typeof acceptEncoding === "string" && acceptEncoding.includes("gzip")) {
      response.setHeader("Vary", "Accept-Encoding");
    }

    next();
  };
}

function createTransportRequestId(): string {
  return `http-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

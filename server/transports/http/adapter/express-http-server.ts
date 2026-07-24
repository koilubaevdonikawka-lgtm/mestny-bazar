import type { ApiServer } from "@server/api/server/api-server";
import type { ApiLogger } from "@server/api/server/api.types";
import { ExpressRequestMapper } from "@server/transports/http/mapping/express-request.mapper";
import { ExpressResponseMapper } from "@server/transports/http/mapping/express-response.mapper";
import {
  createCompressionMiddleware,
  createCorsMiddleware,
  ExpressMiddlewareAdapter,
} from "@server/transports/http/middleware/express-middleware.adapter";
import {
  type HttpServerOptions,
  resolveCorsOptions,
  resolveHttpServerOptions,
} from "@server/transports/http/server/http-server-options";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import type { Server } from "node:http";

export interface ExpressHttpServerOptions {
  apiServer: ApiServer;
  http?: HttpServerOptions;
  logger?: ApiLogger;
}

/** Express transport adapter — delegates all requests to ApiServer.handle(). */
export class ExpressHttpServer {
  private readonly app: Express;
  private readonly options: ReturnType<typeof resolveHttpServerOptions>;
  private readonly middlewareAdapter: ExpressMiddlewareAdapter;
  private httpServer: Server | null = null;

  constructor(private readonly config: ExpressHttpServerOptions) {
    this.options = resolveHttpServerOptions(config.http);
    this.middlewareAdapter = new ExpressMiddlewareAdapter(config.logger);
    this.app = express();
    this.configureApplication();
  }

  getApplication(): Express {
    return this.app;
  }

  isListening(): boolean {
    return this.httpServer?.listening ?? false;
  }

  getAddress(): string | null {
    if (!this.httpServer?.listening) {
      return null;
    }

    const address = this.httpServer.address();
    if (!address) {
      return null;
    }

    if (typeof address === "string") {
      return address;
    }

    return `${this.options.host}:${address.port}`;
  }

  async start(): Promise<void> {
    if (this.httpServer?.listening) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const server = this.app.listen(this.options.port, this.options.host, () => resolve());
      server.once("error", reject);
      this.httpServer = server;
    });
  }

  async stop(): Promise<void> {
    if (!this.httpServer) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.httpServer?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    this.httpServer = null;
  }

  private configureApplication(): void {
    if (this.options.trustProxy !== false) {
      this.app.set("trust proxy", this.options.trustProxy);
    }

    this.app.use(express.json({ limit: this.options.jsonLimit }));
    this.app.use(createCorsMiddleware(resolveCorsOptions(this.options.cors)));
    this.app.use(createCompressionMiddleware(this.options.compression));
    this.middlewareAdapter.apply(this.app);
    this.app.use(this.handleRequest.bind(this));
    this.middlewareAdapter.applyErrorHandler(this.app);
  }

  private async handleRequest(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const context = ExpressRequestMapper.toApiRequestContext(request);
      const envelope = await this.config.apiServer.handle(context);
      ExpressResponseMapper.send(response, envelope);
    } catch (error) {
      next(error);
    }
  }
}

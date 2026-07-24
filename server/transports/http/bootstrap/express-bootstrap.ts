import type { ApplicationContext } from "@server/bootstrap/composition-root";
import { ExpressHttpServer } from "@server/transports/http/adapter/express-http-server";
import type { HttpServerOptions } from "@server/transports/http/server/http-server-options";

export interface ExpressBootstrapResult {
  context: ApplicationContext;
  httpServer: ExpressHttpServer;
}

/** Boots the Express HTTP transport on top of a composed application context. */
export class ExpressBootstrap {
  static create(
    context: ApplicationContext,
    options: HttpServerOptions = {},
  ): ExpressHttpServer {
    return new ExpressHttpServer({
      apiServer: context.apiServer,
      http: options,
    });
  }

  static async start(
    context: ApplicationContext,
    options: HttpServerOptions = {},
  ): Promise<ExpressBootstrapResult> {
    await context.lifecycle.initialize();

    const httpServer = this.create(context, options);
    await context.lifecycle.start();
    await httpServer.start();

    return Object.freeze({
      context,
      httpServer,
    });
  }

  static async stop(result: ExpressBootstrapResult): Promise<void> {
    await result.httpServer.stop();
    await result.context.lifecycle.stop();
  }
}

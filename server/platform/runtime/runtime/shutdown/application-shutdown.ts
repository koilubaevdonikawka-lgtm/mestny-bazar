import type { ApiServer } from "@server/api/server/api-server";

/** Performs graceful API server shutdown. */
export class ApplicationShutdown {
  constructor(private readonly apiServer: ApiServer) {}

  async run(): Promise<void> {
    await this.apiServer.stop();
  }
}

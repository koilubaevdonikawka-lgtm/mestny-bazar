import type { IApplicationLifecycle } from "@server/platform/runtime/runtime/contracts";
import type { ApplicationLifecycleState } from "@server/platform/runtime/runtime/models";
import {
  createApplicationStartedEvent,
  createApplicationStoppedEvent,
} from "@server/platform/runtime/runtime/events";
import { ApplicationStartup } from "@server/platform/runtime/runtime/startup";
import { ApplicationShutdown } from "@server/platform/runtime/runtime/shutdown";
import type { ApiServer } from "@server/api/server/api-server";
import type { StartupValidator } from "@server/bootstrap/startup-validator";

/** Manages runtime application startup, shutdown, and restart. */
export class ApplicationLifecycle implements IApplicationLifecycle {
  private state: ApplicationLifecycleState = "created";

  constructor(
    private readonly apiServer: ApiServer,
    private readonly startupValidator: StartupValidator,
  ) {}

  getState(): ApplicationLifecycleState {
    return this.state;
  }

  async startup(): Promise<void> {
    if (this.state === "started") {
      return;
    }

    this.state = "starting";
    const startup = new ApplicationStartup(() => this.startupValidator.validate());
    const result = startup.run();

    if (!result.validated) {
      this.state = "created";
      throw new Error(
        `Startup validation failed:\n${result.validation.errors.map((error) => `- ${error}`).join("\n")}`,
      );
    }

    await this.apiServer.start();
    this.state = "started";
    createApplicationStartedEvent();
  }

  async shutdown(): Promise<void> {
    if (this.state !== "started") {
      if (this.state === "stopped" || this.state === "created") {
        return;
      }
      throw new Error(`Cannot shutdown application from state "${this.state}"`);
    }

    this.state = "stopping";
    const shutdown = new ApplicationShutdown(this.apiServer);
    await shutdown.run();
    this.state = "stopped";
    createApplicationStoppedEvent({ reason: "shutdown" });
  }

  async restart(): Promise<void> {
    this.state = "restarting";
    await this.shutdown();
    await this.startup();
  }
}

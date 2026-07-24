import type { ApiServer } from "@server/api/server/api-server";
import type { HealthCheck } from "@server/bootstrap/health-check";
import type { StartupValidator } from "@server/bootstrap/startup-validator";
import type { ConfigurationProvider } from "@server/infrastructure/configuration";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";

export type LifecycleState = "created" | "initialized" | "started" | "stopped" | "disposed";

export interface LifecycleDependencies {
  provider: ServiceProvider;
  apiServer: ApiServer;
  configuration: ConfigurationProvider;
  healthCheck: HealthCheck;
  startupValidator: StartupValidator;
}

/** Manages application startup, shutdown, and disposal lifecycle. */
export class LifecycleManager {
  private state: LifecycleState = "created";

  constructor(private readonly dependencies: LifecycleDependencies) {}

  getState(): LifecycleState {
    return this.state;
  }

  async initialize(): Promise<void> {
    this.assertState("created", "initialize");

    const validation = this.dependencies.startupValidator.validate();
    if (!validation.valid) {
      throw new Error(
        `Startup validation failed:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`,
      );
    }

    this.state = "initialized";
  }

  async start(): Promise<void> {
    this.assertState("initialized", "start");
    await this.dependencies.apiServer.start();
    this.state = "started";
  }

  async stop(): Promise<void> {
    if (this.state !== "started") {
      throw new Error(`Cannot stop application from state "${this.state}"`);
    }

    await this.dependencies.apiServer.stop();
    this.state = "stopped";
  }

  async dispose(): Promise<void> {
    if (this.state === "started") {
      await this.stop();
    }

    this.state = "disposed";
  }

  private assertState(expected: LifecycleState, action: string): void {
    if (this.state !== expected) {
      throw new Error(`Cannot ${action} application from state "${this.state}"`);
    }
  }
}

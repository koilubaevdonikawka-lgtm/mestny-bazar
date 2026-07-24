import type { IReadinessService, IHealthService } from "@server/platform/runtime/runtime/contracts";
import { createReadinessStatus, type ReadinessStatus } from "@server/platform/runtime/runtime/models";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceProvider } from "@server/infrastructure/di/service-container";

/** Determines whether the platform is ready to accept requests. */
export class ReadinessService implements IReadinessService {
  constructor(
    private readonly provider: ServiceProvider,
    private readonly healthService: IHealthService,
  ) {}

  async check(): Promise<ReadinessStatus> {
    const blockers: string[] = [];

    try {
      this.provider.resolve(BootstrapTokens.ApiServer);
    } catch (error) {
      blockers.push(formatBlocker("api-server", error));
    }

    const health = await this.healthService.check();
    for (const component of health.components) {
      if (component.status === "unhealthy") {
        blockers.push(`${component.name}: ${component.message ?? "unhealthy"}`);
      }
    }

    const ready = blockers.length === 0;
    return createReadinessStatus({
      ready,
      message: ready ? "Platform is ready to accept requests" : "Platform is not ready",
      blockers,
    });
  }
}

function formatBlocker(name: string, error: unknown): string {
  const reason = error instanceof Error ? error.message : String(error);
  return `${name}: ${reason}`;
}

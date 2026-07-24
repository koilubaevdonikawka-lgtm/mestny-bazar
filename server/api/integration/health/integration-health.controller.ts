import type { HealthCheck } from "@server/bootstrap/health-check";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { createJsonResponse } from "@server/api/integration/routing/integration-controller.helpers";

/** Health HTTP controller — exposes aggregate readiness across infrastructure adapters. */
export class IntegrationHealthController {
  constructor(private readonly healthCheck: HealthCheck) {}

  async getHealth(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const report = await this.healthCheck.check();
    const status = report.status === "healthy" ? 200 : 503;
    return createJsonResponse(context, report, status);
  }
}

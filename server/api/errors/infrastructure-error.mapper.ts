import { ApiInfrastructureError } from "@server/api/errors/api.errors";
import { createProblemDetails, type ProblemDetails } from "@server/api/responses";

/** Maps infrastructure-layer errors to HTTP problem details. */
export class InfrastructureErrorMapper {
  map(error: unknown, instance?: string): ProblemDetails | null {
    if (error instanceof ApiInfrastructureError) {
      return createProblemDetails({
        type: "infrastructure:error",
        title: "Infrastructure error",
        status: error.code === "WEBHOOK_UNAUTHORIZED" ? 401 : 503,
        detail: error.message,
        instance,
        code: error.code,
      });
    }

    if (error instanceof Error && error.name === "InfrastructureError") {
      return createProblemDetails({
        type: "infrastructure:error",
        title: "Infrastructure error",
        status: 503,
        detail: error.message,
        instance,
        code: "INFRASTRUCTURE_ERROR",
      });
    }

    return null;
  }
}

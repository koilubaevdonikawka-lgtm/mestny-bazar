import { ApplicationErrorMapper } from "@server/api/errors/application-error.mapper";
import { DomainErrorMapper } from "@server/api/errors/domain-error.mapper";
import { InfrastructureErrorMapper } from "@server/api/errors/infrastructure-error.mapper";
import { createProblemDetails, type ProblemDetails } from "@server/api/responses";

/** Coordinates error mapping from all layers. */
export class ApiErrorMapper {
  private readonly domain = new DomainErrorMapper();
  private readonly application = new ApplicationErrorMapper();
  private readonly infrastructure = new InfrastructureErrorMapper();

  map(error: unknown, instance?: string): ProblemDetails {
    return (
      this.application.map(error, instance) ??
      this.domain.map(error, instance) ??
      this.infrastructure.map(error, instance) ??
      createProblemDetails({
        type: "about:blank",
        title: "Internal server error",
        status: 500,
        detail: error instanceof Error ? error.message : "Unknown error",
        instance,
        code: "INTERNAL_ERROR",
      })
    );
  }
}

export { DomainErrorMapper, ApplicationErrorMapper, InfrastructureErrorMapper };

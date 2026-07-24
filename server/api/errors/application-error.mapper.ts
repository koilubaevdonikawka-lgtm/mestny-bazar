import { ApiApplicationError, ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import { createProblemDetails, type ProblemDetails } from "@server/api/responses";

/** Maps application-layer errors to HTTP problem details. */
export class ApplicationErrorMapper {
  map(error: unknown, instance?: string): ProblemDetails | null {
    if (error instanceof ApiValidationError) {
      return createProblemDetails({
        type: "application:validation",
        title: "Validation failed",
        status: 422,
        detail: error.message,
        instance,
        code: "VALIDATION_ERROR",
        errors: error.fieldErrors,
      });
    }

    if (error instanceof ApiNotFoundError) {
      return createProblemDetails({
        type: "application:not_found",
        title: "Resource not found",
        status: 404,
        detail: error.message,
        instance,
        code: "NOT_FOUND",
      });
    }

    if (error instanceof ApiApplicationError) {
      return createProblemDetails({
        type: "application:error",
        title: "Application error",
        status: 400,
        detail: error.message,
        instance,
        code: error.code,
      });
    }

    if (error instanceof Error && error.message.includes("not found")) {
      return createProblemDetails({
        type: "application:not_found",
        title: "Resource not found",
        status: 404,
        detail: error.message,
        instance,
        code: "NOT_FOUND",
      });
    }

    return null;
  }
}

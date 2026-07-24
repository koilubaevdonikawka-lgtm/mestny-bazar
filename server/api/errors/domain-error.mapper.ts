import { createProblemDetails, type ProblemDetails } from "@server/api/responses";

interface DomainErrorLike {
  code?: string;
  message: string;
  name: string;
}

/** Maps domain layer errors to HTTP problem details. */
export class DomainErrorMapper {
  map(error: unknown, instance?: string): ProblemDetails | null {
    if (!this.isDomainError(error)) {
      return null;
    }

    const status = this.resolveStatus(error.code);
    return createProblemDetails({
      type: `domain:${error.code ?? "DOMAIN_ERROR"}`,
      title: "Domain rule violation",
      status,
      detail: error.message,
      instance,
      code: error.code,
    });
  }

  private isDomainError(error: unknown): error is DomainErrorLike {
    return (
      error instanceof Error &&
      "code" in error &&
      typeof (error as DomainErrorLike).code === "string" &&
      (error.name.includes("DomainError") ||
        error.name.includes("Error") &&
          typeof (error as DomainErrorLike).code === "string")
    );
  }

  private resolveStatus(code?: string): number {
    if (!code) {
      return 400;
    }

    if (code.includes("NOT_FOUND") || code.includes("INVARIANT")) {
      return 404;
    }

    if (code.includes("POLICY") || code.includes("LIFECYCLE") || code.includes("HIERARCHY")) {
      return 409;
    }

    if (code.startsWith("INVALID_")) {
      return 422;
    }

    return 400;
  }
}

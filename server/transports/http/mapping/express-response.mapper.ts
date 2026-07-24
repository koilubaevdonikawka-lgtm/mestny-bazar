import type { ApiResponseEnvelope } from "@server/api/server/api.types";
import type { Response } from "express";

/** Maps transport-agnostic API responses to Express responses. */
export class ExpressResponseMapper {
  static send(response: Response, envelope: ApiResponseEnvelope): void {
    response.status(envelope.status);

    for (const [name, value] of Object.entries(envelope.headers)) {
      response.setHeader(name, value);
    }

    if (envelope.body === undefined || envelope.body === null) {
      response.end();
      return;
    }

    if (shouldSendJson(envelope)) {
      response.json(envelope.body);
      return;
    }

    if (typeof envelope.body === "string") {
      response.send(envelope.body);
      return;
    }

    response.json(envelope.body);
  }
}

function shouldSendJson(envelope: ApiResponseEnvelope): boolean {
  const contentType = envelope.headers["content-type"] ?? envelope.headers["Content-Type"];
  return contentType?.includes("application/json") ?? false;
}

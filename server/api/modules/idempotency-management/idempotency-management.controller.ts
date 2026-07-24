import { ApiValidationError } from "@server/api/errors/api.errors";
import type { IdempotencyManagementApplicationService } from "@server/application/idempotency-management/services/idempotency-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readNumber,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Idempotency management HTTP controller — duplicate operation prevention only. */
export class IdempotencyManagementController {
  constructor(private readonly idempotency: IdempotencyManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const result = await this.idempotency.registerKey({
      idempotencyKey: readString(body.idempotencyKey),
      scope: readString(body.scope),
      ttlSeconds: readNumber(body.ttlSeconds),
    });
    return createJsonResponse(context, result.value, 201);
  }

  async check(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const idempotencyKey = readString(body.idempotencyKey);

    if (!idempotencyKey) {
      throw new ApiValidationError({ idempotencyKey: ["idempotencyKey is required"] });
    }

    const result = await this.idempotency.checkKey({
      idempotencyKey,
      scope: readString(body.scope),
    });
    return createJsonResponse(context, result.value);
  }

  async store(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const idempotencyKey = readString(body.idempotencyKey);

    if (!idempotencyKey) {
      throw new ApiValidationError({ idempotencyKey: ["idempotencyKey is required"] });
    }
    if (!("result" in body)) {
      throw new ApiValidationError({ result: ["result is required"] });
    }

    const result = await this.idempotency.storeResult({
      idempotencyKey,
      scope: readString(body.scope),
      result: body.result,
    });
    return createJsonResponse(context, result.value);
  }

  async result(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const idempotencyKey = readString(body.idempotencyKey);

    if (!idempotencyKey) {
      throw new ApiValidationError({ idempotencyKey: ["idempotencyKey is required"] });
    }

    const response = await this.idempotency.getStoredResult({
      idempotencyKey,
      scope: readString(body.scope),
    });
    return createJsonResponse(context, response.value);
  }

  async expire(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const idempotencyKey = readString(body.idempotencyKey);

    if (!idempotencyKey) {
      throw new ApiValidationError({ idempotencyKey: ["idempotencyKey is required"] });
    }

    const result = await this.idempotency.expireKey({
      idempotencyKey,
      scope: readString(body.scope),
    });
    return createJsonResponse(context, result.value);
  }

  async cleanup(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.idempotency.cleanupExpiredKeys();
    return createJsonResponse(context, result.value);
  }
}

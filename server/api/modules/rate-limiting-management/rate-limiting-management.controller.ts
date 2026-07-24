import { ApiValidationError } from "@server/api/errors/api.errors";
import type { RateLimitingManagementApplicationService } from "@server/application/rate-limiting-management/services/rate-limiting-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Rate limiting HTTP controller — limit rule registration and checking only. */
export class RateLimitingManagementController {
  constructor(private readonly rateLimits: RateLimitingManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const key = readString(body.key);
    const description = readString(body.description);
    const maxRequests = this.readPositiveNumber(body.maxRequests, "maxRequests");
    const windowSeconds = this.readPositiveNumber(body.windowSeconds, "windowSeconds");

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!key) {
      throw new ApiValidationError({ key: ["key is required"] });
    }

    const result = await this.rateLimits.registerRateLimitRule({
      name,
      key,
      maxRequests,
      windowSeconds,
      description: description ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async check(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const ruleId = readString(body.ruleId);
    const counterKey = readString(body.counterKey);

    if (!ruleId) {
      throw new ApiValidationError({ ruleId: ["ruleId is required"] });
    }

    const result = await this.rateLimits.checkRateLimit({
      ruleId,
      counterKey: counterKey ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async increment(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const ruleId = readString(body.ruleId);
    const counterKey = readString(body.counterKey);

    if (!ruleId) {
      throw new ApiValidationError({ ruleId: ["ruleId is required"] });
    }

    const result = await this.rateLimits.incrementRateLimitCounter({
      ruleId,
      counterKey: counterKey ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async reset(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const ruleId = readString(body.ruleId);
    const counterKey = readString(body.counterKey);

    if (!ruleId) {
      throw new ApiValidationError({ ruleId: ["ruleId is required"] });
    }

    const result = await this.rateLimits.resetRateLimitCounter({
      ruleId,
      counterKey: counterKey ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.rateLimits.listRateLimitRules();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ruleId = this.requireRuleId(context);
    const result = await this.rateLimits.getRateLimitRule(ruleId);
    if (!result.value) {
      throw new ApiValidationError({ ruleId: [`Rate limit rule not found: ${ruleId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ruleId = this.requireRuleId(context);
    const result = await this.rateLimits.deleteRateLimitRule(ruleId);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.rateLimits.getRateLimitStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireRuleId(context: ApiRequestContext): string {
    const ruleId = readString(context.params.ruleId);
    if (!ruleId) {
      throw new ApiValidationError({ ruleId: ["ruleId is required"] });
    }
    return ruleId;
  }

  private readPositiveNumber(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      throw new ApiValidationError({ [field]: [`${field} is required and must be a positive number`] });
    }
    return value;
  }
}

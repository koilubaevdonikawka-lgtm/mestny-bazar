import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiActionSecurityApplicationService } from "@server/application/ai-action-security/services/ai-action-security-application.service";
import type { SecurityPolicyRules } from "@server/application/ai-action-security/models/security-policy.model";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Action Security HTTP controller — action validation only, no execution. */
export class AiActionSecurityController {
  constructor(private readonly security: AiActionSecurityApplicationService) {}

  async registerPolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }

    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.security.registerSecurityPolicy({
      name,
      description: description ?? undefined,
      rules: this.readRules(body.rules),
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPolicies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.security.listSecurityPolicies();
    return createJsonResponse(context, result.value);
  }

  async getPolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const result = await this.security.getSecurityPolicy(policyId);
    if (!result.value) {
      throw new ApiValidationError({ policyId: [`Security policy not found: ${policyId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const description = readString(body.description);
    const status = this.readStatus(body.status);

    const result = await this.security.updateSecurityPolicy({
      policyId,
      name: name ?? undefined,
      description: description ?? undefined,
      rules: this.readRules(body.rules),
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const policyId = this.requirePolicyId(context);
    const result = await this.security.deleteSecurityPolicy(policyId);
    return createJsonResponse(context, result.value);
  }

  async validate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const actionName = readString(body.actionName);

    if (!actionName) {
      throw new ApiValidationError({ actionName: ["actionName is required"] });
    }

    const agentId = readString(body.agentId);
    const policyId = readString(body.policyId);

    const result = await this.security.validateAgentAction({
      actionName,
      agentId: agentId ?? undefined,
      payload: "payload" in body ? body.payload : undefined,
      policyId: policyId ?? undefined,
    });
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.security.getSecurityAuditHistory();
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.security.getSecurityStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePolicyId(context: ApiRequestContext): string {
    const policyId = readString(context.params.policyId);
    if (!policyId) {
      throw new ApiValidationError({ policyId: ["policyId is required"] });
    }
    return policyId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }

  private readRules(value: unknown): SecurityPolicyRules | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== "object") {
      throw new ApiValidationError({ rules: ["rules must be an object"] });
    }

    const record = value as Record<string, unknown>;
    return Object.freeze({
      blockedActions: this.readStringArray(record.blockedActions, "blockedActions"),
      blockedPatterns: this.readStringArray(record.blockedPatterns, "blockedPatterns"),
      allowedActions: this.readStringArray(record.allowedActions, "allowedActions"),
    });
  }

  private readStringArray(value: unknown, field: string): readonly string[] | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
      throw new ApiValidationError({ [field]: [`${field} must be an array of strings`] });
    }
    return Object.freeze([...value]);
  }
}

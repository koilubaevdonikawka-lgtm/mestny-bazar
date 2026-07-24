import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AuthorizationManagementApplicationService } from "@server/application/authorization-management/services/authorization-management-application.service";
import type { AuthenticatedUser } from "@server/application/authorization-management/models/authorization.model";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Authorization management HTTP controller — access checks only. */
export class AuthorizationManagementController {
  constructor(private readonly authorization: AuthorizationManagementApplicationService) {}

  async check(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const user = readAuthenticatedUser(body, context);
    const action = readString(body.action);

    if (!action) {
      throw new ApiValidationError({ action: ["action is required"] });
    }

    const result = await this.authorization.authorizeAction({
      user,
      action,
      resource: readString(body.resource),
    });
    return createJsonResponse(context, result.value);
  }

  async role(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const user = readAuthenticatedUser(body, context);
    const role = readString(body.role);

    if (!role) {
      throw new ApiValidationError({ role: ["role is required"] });
    }

    const result = await this.authorization.checkRole({ user, role });
    return createJsonResponse(context, result.value);
  }

  async permission(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const user = readAuthenticatedUser(body, context);
    const permission = readString(body.permission);
    const permissions = readStringArray(body.permissions);

    if (!permission && (!permissions || permissions.length === 0)) {
      throw new ApiValidationError({
        permission: ["permission or permissions is required"],
      });
    }

    const result = await this.authorization.checkPermission({
      user,
      permission: permission ?? permissions![0]!,
      permissions,
      requireAll: readBoolean(body.requireAll, true),
    });
    return createJsonResponse(context, result.value);
  }

  async resource(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const user = readAuthenticatedUser(body, context);
    const resource = readString(body.resource);
    const action = readString(body.action);

    if (!resource) {
      throw new ApiValidationError({ resource: ["resource is required"] });
    }
    if (!action) {
      throw new ApiValidationError({ action: ["action is required"] });
    }

    const result = await this.authorization.checkResourceAccess({ user, resource, action });
    return createJsonResponse(context, result.value);
  }

  async permissions(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const userId = readString(context.params.userId);
    if (!userId) {
      throw new ApiValidationError({ userId: ["userId is required"] });
    }

    const body = context.body && typeof context.body === "object" ? readRecordBody(context.body) : {};
    const user = readAuthenticatedUser(body, context, userId);
    const result = await this.authorization.getEffectivePermissions(userId, user);
    return createJsonResponse(context, result.value);
  }

  async registerPolicy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const resourcePattern = readString(body.resourcePattern);
    const action = readString(body.action);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!resourcePattern) {
      throw new ApiValidationError({ resourcePattern: ["resourcePattern is required"] });
    }
    if (!action) {
      throw new ApiValidationError({ action: ["action is required"] });
    }

    const effect = readString(body.effect);
    const result = await this.authorization.registerPolicy({
      name,
      resourcePattern,
      action,
      requiredRoles: readStringArray(body.requiredRoles),
      requiredPermissions: readStringArray(body.requiredPermissions),
      effect: effect === "deny" ? "deny" : effect === "allow" ? "allow" : undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }
}

function readAuthenticatedUser(
  body: Record<string, unknown>,
  context: ApiRequestContext,
  fallbackUserId?: string,
): AuthenticatedUser {
  const userId = readString(body.userId) ?? fallbackUserId ?? resolveCustomerId(context);
  return {
    userId,
    roles: readStringArray(body.roles),
    permissions: readStringArray(body.permissions),
  };
}

function readBoolean(value: unknown, defaultValue: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }
  return defaultValue;
}

function readStringArray(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return items.length > 0 ? Object.freeze(items) : undefined;
}

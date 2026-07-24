import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AuthenticationManagementApplicationService } from "@server/application/authentication-management/services/authentication-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readHeader,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Authentication management HTTP controller — identity confirmation only. */
export class AuthenticationManagementController {
  constructor(private readonly authentication: AuthenticationManagementApplicationService) {}

  async login(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const username = readString(body.username);
    const password = readString(body.password);

    if (!username) {
      throw new ApiValidationError({ username: ["username is required"] });
    }
    if (!password) {
      throw new ApiValidationError({ password: ["password is required"] });
    }

    const result = await this.authentication.login({ username, password });
    return createJsonResponse(context, result.value, 201);
  }

  async logout(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const result = await this.authentication.logout({
      sessionId: readString(body.sessionId) ?? readSessionIdFromHeaders(context),
      accessToken: readString(body.accessToken) ?? readAccessTokenFromHeaders(context),
    });
    return createJsonResponse(context, result.value);
  }

  async refresh(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const refreshToken = readString(body.refreshToken);

    if (!refreshToken) {
      throw new ApiValidationError({ refreshToken: ["refreshToken is required"] });
    }

    const result = await this.authentication.refreshSession({ refreshToken });
    return createJsonResponse(context, result.value);
  }

  async revoke(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const sessionId = readString(body.sessionId) ?? readSessionIdFromHeaders(context);

    if (!sessionId) {
      throw new ApiValidationError({ sessionId: ["sessionId is required"] });
    }

    const result = await this.authentication.revokeSession({ sessionId });
    return createJsonResponse(context, result.value);
  }

  async session(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const result = await this.authentication.getCurrentSession({
      sessionId: readString(body.sessionId) ?? readSessionIdFromHeaders(context),
      accessToken: readString(body.accessToken) ?? readAccessTokenFromHeaders(context),
    });

    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }

    return createJsonResponse(context, result.value);
  }

  async validate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const result = await this.authentication.validateSession({
      sessionId: readString(body.sessionId) ?? readSessionIdFromHeaders(context),
      accessToken: readString(body.accessToken) ?? readAccessTokenFromHeaders(context),
    });
    return createJsonResponse(context, result.value);
  }
}

function readAccessTokenFromHeaders(context: ApiRequestContext): string | undefined {
  const authorization = readHeader(context.headers, "authorization");
  if (!authorization) {
    return readHeader(context.headers, "x-access-token");
  }

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim() || undefined;
  }

  return authorization;
}

function readSessionIdFromHeaders(context: ApiRequestContext): string | undefined {
  return readHeader(context.headers, "x-session-id");
}

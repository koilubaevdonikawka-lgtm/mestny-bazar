import { ApiValidationError } from "@server/api/errors/api.errors";
import type { PluginManagementApplicationService } from "@server/application/plugin-management/services/plugin-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Plugin HTTP controller — plugin registration and lifecycle only. */
export class PluginManagementController {
  constructor(private readonly plugins: PluginManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const version = readString(body.version);
    const description = readString(body.description);
    const source = readString(body.source);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!version) {
      throw new ApiValidationError({ version: ["version is required"] });
    }

    const result = await this.plugins.registerPlugin({
      name,
      version,
      description: description ?? undefined,
      source: source ?? undefined,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async install(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const pluginId = readString(body.pluginId);

    if (!pluginId) {
      throw new ApiValidationError({ pluginId: ["pluginId is required"] });
    }

    const result = await this.plugins.installPlugin({ pluginId });
    return createJsonResponse(context, result.value);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const pluginId = this.requirePluginId(context);
    const result = await this.plugins.uninstallPlugin(pluginId);
    return createJsonResponse(context, result.value);
  }

  async enable(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const pluginId = this.requirePluginId(context);
    const result = await this.plugins.enablePlugin(pluginId);
    return createJsonResponse(context, result.value);
  }

  async disable(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const pluginId = this.requirePluginId(context);
    const result = await this.plugins.disablePlugin(pluginId);
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.plugins.listPlugins();
    return createJsonResponse(context, result.value);
  }

  async get(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const pluginId = this.requirePluginId(context);
    const result = await this.plugins.getPlugin(pluginId);
    if (!result.value) {
      throw new ApiValidationError({ pluginId: [`Plugin not found: ${pluginId}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async status(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const pluginId = this.requirePluginId(context);
    const result = await this.plugins.getPluginStatus(pluginId);
    return createJsonResponse(context, result.value);
  }

  private requirePluginId(context: ApiRequestContext): string {
    const pluginId = readString(context.params.pluginId);
    if (!pluginId) {
      throw new ApiValidationError({ pluginId: ["pluginId is required"] });
    }
    return pluginId;
  }
}

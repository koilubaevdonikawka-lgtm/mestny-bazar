import type { IGatewayManager } from "@server/platform/gateway/gateway/contracts";
import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { IRouteResolver } from "@server/platform/gateway/gateway/contracts";
import type { ISchemaRegistry } from "@server/platform/gateway/gateway/contracts";
import type { IApiVersionManager } from "@server/platform/gateway/gateway/contracts";
import type { EndpointDispatcher } from "@server/platform/gateway/gateway/routing";
import {
  createGatewayValidationResult,
  type GatewayDispatchResult,
  type GatewayEndpoint,
  type GatewayRequest,
  type GatewayRoute,
  type GatewayValidationResult,
} from "@server/platform/gateway/gateway/models";
import { createRequestValidatedEvent } from "@server/platform/gateway/gateway/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { SDKPlatform } from "@server/platform/sdk/sdk/sdk-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Orchestrates gateway registration, routing, validation and dispatch. */
export class GatewayManager implements IGatewayManager {
  constructor(
    private readonly registry: IEndpointRegistry,
    private readonly routeResolver: IRouteResolver,
    private readonly dispatcher: EndpointDispatcher,
    private readonly schemaRegistry: ISchemaRegistry,
    private readonly versionManager: IApiVersionManager,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly release: ReleasePlatform,
    private readonly sdk: SDKPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  registerEndpoint(endpoint: GatewayEndpoint): void {
    this.registry.registerEndpoint(endpoint);
  }

  registerRoute(route: GatewayRoute): void {
    this.registry.registerRoute(route);
  }

  resolve(request: GatewayRequest): GatewayRoute | undefined {
    return this.routeResolver.resolve(request);
  }

  dispatch(request: GatewayRequest): GatewayDispatchResult {
    const validation = this.validate(request);
    if (!validation.valid) {
      return this.dispatcher.dispatch({
        ...request,
        headers: Object.freeze({
          ...request.headers,
          "x-gateway-validation": "failed",
        }),
      });
    }
    return this.dispatcher.dispatch(request);
  }

  validate(request: GatewayRequest): GatewayValidationResult {
    this.assertPlatformIntegrations();
    const violations: string[] = [];
    const version = this.versionManager.resolveVersion(request.version);

    if (!version) {
      violations.push(`Unsupported API version: ${request.version}`);
    }

    const requestSchema = this.schemaRegistry.getSchema("schema-request-gateway");
    if (!requestSchema) {
      violations.push("Request schema not registered.");
    }

    const architecture = this.documentation.validateArchitecture();
    if (!architecture.valid) {
      violations.push(`${architecture.violations.length} architecture violations.`);
    }

    if (this.providerRegistry.list().length === 0) {
      violations.push("No providers registered in ProviderRegistry.");
    }

    if (request.path.includes("/sdk/")) {
      try {
        this.sdk.generateManifest("sdk-typescript");
      } catch {
        violations.push("SDK platform manifest unavailable for SDK route.");
      }
    }

    const route = this.routeResolver.resolve(request);
    if (!route) {
      violations.push(`No route found for ${request.method} ${request.path}`);
    }

    const result = createGatewayValidationResult({
      requestId: request.id,
      valid: violations.length === 0,
      violations,
    });
    createRequestValidatedEvent(result);
    return result;
  }

  private assertPlatformIntegrations(): void {
    if (!this.documentation || !this.governance || !this.release || !this.sdk) {
      throw new Error("Gateway platform integrations are not available.");
    }
  }
}

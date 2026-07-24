import type { IGatewayManager } from "@server/platform/gateway/gateway/contracts";
import type { IApiVersionManager } from "@server/platform/gateway/gateway/contracts";
import type {
  GatewayDispatchResult,
  GatewayEndpoint,
  GatewayRequest,
  GatewayRoute,
  GatewayValidationResult,
} from "@server/platform/gateway/gateway/models";

/** Public gateway platform facade. */
export class GatewayPlatform {
  constructor(
    private readonly gatewayManager: IGatewayManager,
    private readonly versionManager: IApiVersionManager,
  ) {}

  registerEndpoint(endpoint: GatewayEndpoint): void {
    this.gatewayManager.registerEndpoint(endpoint);
  }

  registerRoute(route: GatewayRoute): void {
    this.gatewayManager.registerRoute(route);
  }

  resolve(request: GatewayRequest): GatewayRoute | undefined {
    return this.gatewayManager.resolve(request);
  }

  dispatch(request: GatewayRequest): GatewayDispatchResult {
    return this.gatewayManager.dispatch(request);
  }

  validate(request: GatewayRequest): GatewayValidationResult {
    return this.gatewayManager.validate(request);
  }

  supportedVersions() {
    return this.versionManager.supportedVersions();
  }
}

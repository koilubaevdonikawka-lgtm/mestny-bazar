import type { IEndpointRegistry } from "@server/platform/gateway/gateway/contracts";
import type { IRouteResolver } from "@server/platform/gateway/gateway/contracts";
import type { GatewayMiddlewarePipeline } from "@server/platform/gateway/gateway/middleware";
import {
  createGatewayDispatchResult,
  createGatewayResponse,
  type GatewayDispatchResult,
  type GatewayRequest,
} from "@server/platform/gateway/gateway/models";
import { createGatewayDispatchCompletedEvent } from "@server/platform/gateway/gateway/events";

/** Dispatches validated gateway requests to registered endpoints (metadata only). */
export class EndpointDispatcher {
  constructor(
    private readonly registry: IEndpointRegistry,
    private readonly routeResolver: IRouteResolver,
    private readonly middlewarePipeline: GatewayMiddlewarePipeline,
  ) {}

  dispatch(request: GatewayRequest): GatewayDispatchResult {
    const route = this.routeResolver.resolve(request);
    if (!route) {
      const response = createGatewayResponse({
        requestId: request.id,
        status: 404,
        endpointId: "not-found",
        version: request.version,
        body: Object.freeze({ error: "Route not found" }),
      });
      const result = createGatewayDispatchResult({ request, response });
      createGatewayDispatchCompletedEvent(result);
      return result;
    }

    const endpoint = this.registry.getEndpoint(route.endpointId);
    const middlewareApplied = this.middlewarePipeline.applyMetadata(request);

    const response = createGatewayResponse({
      requestId: request.id,
      status: 200,
      endpointId: route.endpointId,
      version: route.version,
      body: Object.freeze({
        endpoint: endpoint?.id,
        path: endpoint?.path,
        kind: endpoint?.kind,
        dispatched: true,
      }),
    });

    const result = createGatewayDispatchResult({
      request,
      response,
      middlewareApplied,
    });
    createGatewayDispatchCompletedEvent(result);
    return result;
  }
}

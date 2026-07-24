import type { EndpointRegisteredEvent } from "./endpoint-registered.event";
import type { RouteRegisteredEvent } from "./route-registered.event";
import type { RequestValidatedEvent } from "./request-validated.event";
import type { GatewayDispatchCompletedEvent } from "./gateway-dispatch-completed.event";

export {
  type EndpointRegisteredEvent,
  createEndpointRegisteredEvent,
} from "./endpoint-registered.event";
export {
  type RouteRegisteredEvent,
  createRouteRegisteredEvent,
} from "./route-registered.event";
export {
  type RequestValidatedEvent,
  createRequestValidatedEvent,
} from "./request-validated.event";
export {
  type GatewayDispatchCompletedEvent,
  createGatewayDispatchCompletedEvent,
} from "./gateway-dispatch-completed.event";

export type GatewayPlatformEvent =
  | EndpointRegisteredEvent
  | RouteRegisteredEvent
  | RequestValidatedEvent
  | GatewayDispatchCompletedEvent;

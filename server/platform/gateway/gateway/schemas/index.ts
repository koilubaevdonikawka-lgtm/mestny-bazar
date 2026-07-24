import type { SchemaDescriptor } from "@server/platform/gateway/gateway/contracts";

export const DEFAULT_SCHEMAS: readonly SchemaDescriptor[] = Object.freeze([
  { id: "schema-request-gateway", kind: "request", name: "GatewayRequest", version: "v1.0" },
  { id: "schema-response-gateway", kind: "response", name: "GatewayResponse", version: "v1.0" },
  { id: "schema-error-gateway", kind: "error", name: "GatewayError", version: "v1.0" },
  { id: "schema-webhook-gateway", kind: "webhook", name: "GatewayWebhook", version: "v1.0" },
]);

export { SchemaRegistry } from "./schema-registry";

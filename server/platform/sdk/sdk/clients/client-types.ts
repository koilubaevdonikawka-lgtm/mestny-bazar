import type { SDKClientKind } from "@server/platform/sdk/sdk/models";
import { createSDKClient } from "@server/platform/sdk/sdk/models";

export interface ClientTypeMetadata {
  readonly kind: SDKClientKind;
  readonly name: string;
  readonly description: string;
  readonly transport: string;
}

/** Predefined SDK client type metadata (no file generation). */
export const CLIENT_TYPE_CATALOG: readonly ClientTypeMetadata[] = Object.freeze([
  {
    kind: "typescript",
    name: "TypeScript SDK",
    description: "Typed SDK for TypeScript consumers.",
    transport: "module-api",
  },
  {
    kind: "javascript",
    name: "JavaScript SDK",
    description: "JavaScript SDK for browser and Node.js consumers.",
    transport: "module-api",
  },
  {
    kind: "rest",
    name: "REST SDK",
    description: "HTTP REST SDK metadata for external integrations.",
    transport: "http",
  },
  {
    kind: "cli",
    name: "CLI SDK",
    description: "Command-line SDK metadata for automation clients.",
    transport: "stdio",
  },
  {
    kind: "webhook",
    name: "Webhook SDK",
    description: "Webhook subscription SDK metadata for event consumers.",
    transport: "webhook",
  },
]);

export const DEFAULT_SDK_CLIENTS = Object.freeze([
  createSDKClient({
    id: "sdk-typescript",
    name: "TypeScript SDK",
    kind: "typescript",
    version: "1.0.0",
    supportedPlatforms: ["platform-documentation", "platform-release"],
  }),
  createSDKClient({
    id: "sdk-javascript",
    name: "JavaScript SDK",
    kind: "javascript",
    version: "1.0.0",
    supportedPlatforms: ["platform-documentation", "platform-release"],
  }),
  createSDKClient({
    id: "sdk-rest",
    name: "REST SDK",
    kind: "rest",
    version: "1.0.0",
    supportedPlatforms: ["platform-documentation", "platform-integration"],
  }),
  createSDKClient({
    id: "sdk-cli",
    name: "CLI SDK",
    kind: "cli",
    version: "1.0.0",
    supportedPlatforms: ["platform-developer", "platform-operations"],
  }),
  createSDKClient({
    id: "sdk-webhook",
    name: "Webhook SDK",
    kind: "webhook",
    version: "1.0.0",
    supportedPlatforms: ["platform-integration", "platform-governance"],
  }),
]);

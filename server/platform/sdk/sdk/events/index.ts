import type { SDKRegisteredEvent } from "./sdk-registered.event";
import type { SDKGeneratedEvent } from "./sdk-generated.event";
import type { SDKValidatedEvent } from "./sdk-validated.event";
import type { SDKCompatibilityCheckedEvent } from "./sdk-compatibility-checked.event";

export {
  type SDKRegisteredEvent,
  createSDKRegisteredEvent,
} from "./sdk-registered.event";
export {
  type SDKGeneratedEvent,
  createSDKGeneratedEvent,
} from "./sdk-generated.event";
export {
  type SDKValidatedEvent,
  createSDKValidatedEvent,
} from "./sdk-validated.event";
export {
  type SDKCompatibilityCheckedEvent,
  createSDKCompatibilityCheckedEvent,
} from "./sdk-compatibility-checked.event";

export type SDKPlatformEvent =
  | SDKRegisteredEvent
  | SDKGeneratedEvent
  | SDKValidatedEvent
  | SDKCompatibilityCheckedEvent;

import type {
  ProviderCapabilityValue,
  ProviderConfiguration,
  ProviderDescriptor,
  ProviderHealth,
} from "@server/platform/integration/integration/models";
import { createProviderHealth } from "@server/platform/integration/integration/models";
import {
  createProviderRegisteredEvent,
  createProviderUnavailableEvent,
  createProviderHealthChangedEvent,
  type ProviderRegisteredEvent,
  type ProviderUnavailableEvent,
  type ProviderHealthChangedEvent,
} from "@server/platform/integration/integration/events";

export type IntegrationPlatformEvent =
  | ProviderRegisteredEvent
  | ProviderUnavailableEvent
  | ProviderHealthChangedEvent;

export interface ProviderRegistrationOptions {
  readonly configuration?: ProviderConfiguration;
  readonly healthCheck?: () => Promise<ProviderHealth>;
}

interface RegisteredProviderEntry {
  readonly descriptor: ProviderDescriptor;
  readonly instance: unknown;
  readonly configuration?: ProviderConfiguration;
  readonly healthCheck?: () => Promise<ProviderHealth>;
}

/** Central registry for all external service providers. */
export class ProviderRegistry {
  private readonly providers = new Map<string, RegisteredProviderEntry>();
  private readonly eventListeners = new Set<(event: IntegrationPlatformEvent) => void>();

  register<T>(
    descriptor: ProviderDescriptor,
    instance: T,
    options: ProviderRegistrationOptions = {},
  ): void {
    const id = descriptor.id.trim();
    if (!id) {
      throw new Error("Provider id is required.");
    }

    this.providers.set(id, Object.freeze({
      descriptor,
      instance,
      configuration: options.configuration,
      healthCheck: options.healthCheck,
    }));

    this.emit(createProviderRegisteredEvent(descriptor));
  }

  unregister(providerId: string): boolean {
    const id = providerId.trim();
    const removed = this.providers.delete(id);
    if (removed) {
      this.emit(createProviderUnavailableEvent({ providerId: id, reason: "unregistered" }));
    }
    return removed;
  }

  get<T>(providerId: string): T | null {
    const entry = this.providers.get(providerId.trim());
    if (!entry || !entry.descriptor.enabled) {
      return null;
    }
    return entry.instance as T;
  }

  list(capability?: ProviderCapabilityValue): readonly ProviderDescriptor[] {
    const descriptors = [...this.providers.values()].map((entry) => entry.descriptor);
    if (!capability) {
      return Object.freeze(descriptors);
    }
    return Object.freeze(descriptors.filter((descriptor) => descriptor.capability === capability));
  }

  async health(providerId?: string): Promise<ProviderHealth | readonly ProviderHealth[]> {
    if (providerId) {
      return this.checkProviderHealth(providerId.trim());
    }

    const results = await Promise.all(
      [...this.providers.keys()].map((id) => this.checkProviderHealth(id)),
    );
    return Object.freeze(results);
  }

  onEvent(listener: (event: IntegrationPlatformEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  private async checkProviderHealth(providerId: string): Promise<ProviderHealth> {
    const entry = this.providers.get(providerId);
    if (!entry) {
      const health = createProviderHealth({
        providerId,
        status: "unavailable",
        message: "Provider is not registered.",
      });
      this.emit(createProviderHealthChangedEvent(health));
      return health;
    }

    if (!entry.descriptor.enabled) {
      const health = createProviderHealth({
        providerId,
        status: "unavailable",
        message: "Provider is disabled.",
      });
      this.emit(createProviderHealthChangedEvent(health));
      return health;
    }

    const health = entry.healthCheck
      ? await entry.healthCheck()
      : createProviderHealth({ providerId, status: "healthy" });

    this.emit(createProviderHealthChangedEvent(health));
    return health;
  }

  private emit(event: IntegrationPlatformEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }
}

export { ProviderRegistry as default };

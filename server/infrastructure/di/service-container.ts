export type ServiceToken<T = unknown> = symbol | string;

export type ServiceLifetime = "singleton" | "transient" | "scoped";

export type ServiceFactory<T = unknown> = (provider: ServiceProvider) => T;

export interface ServiceRegistration<T = unknown> {
  token: ServiceToken<T>;
  lifetime: ServiceLifetime;
  factory: ServiceFactory<T>;
}

export interface ServiceScope {
  readonly id: string;
  resolve<T>(token: ServiceToken<T>): T;
  dispose(): void;
}

export class ServiceRegistry {
  private readonly registrations = new Map<ServiceToken, ServiceRegistration>();

  register<T>(
    token: ServiceToken<T>,
    lifetime: ServiceLifetime,
    factory: ServiceFactory<T>,
  ): this {
    this.registrations.set(token, {
      token,
      lifetime,
      factory,
    });
    return this;
  }

  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.register(token, "singleton", factory);
  }

  registerTransient<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.register(token, "transient", factory);
  }

  registerScoped<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.register(token, "scoped", factory);
  }

  getRegistration<T>(token: ServiceToken<T>): ServiceRegistration<T> | undefined {
    return this.registrations.get(token) as ServiceRegistration<T> | undefined;
  }

  has(token: ServiceToken): boolean {
    return this.registrations.has(token);
  }
}

export class ServiceProvider {
  private readonly singletons = new Map<ServiceToken, unknown>();

  constructor(private readonly registry: ServiceRegistry) {}

  resolve<T>(token: ServiceToken<T>, scopeCache?: Map<ServiceToken, unknown>): T {
    const registration = this.registry.getRegistration(token);
    if (!registration) {
      throw new Error(`Service not registered: ${String(token)}`);
    }

    if (registration.lifetime === "singleton") {
      const cached = this.singletons.get(token);
      if (cached) {
        return cached as T;
      }

      const instance = registration.factory(this);
      this.singletons.set(token, instance);
      return instance;
    }

    if (registration.lifetime === "scoped") {
      const cache = scopeCache ?? new Map<ServiceToken, unknown>();
      const cached = cache.get(token);
      if (cached) {
        return cached as T;
      }

      const instance = registration.factory(this);
      cache.set(token, instance);
      return instance;
    }

    return registration.factory(this) as T;
  }

  createScope(): ServiceScope {
    const scopeCache = new Map<ServiceToken, unknown>();
    const scopeId = `scope-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return {
      id: scopeId,
      resolve: <T>(token: ServiceToken<T>) => this.resolve(token, scopeCache),
      dispose: () => {
        scopeCache.clear();
      },
    };
  }
}

export class DependencyResolver {
  constructor(private readonly provider: ServiceProvider) {}

  resolve<T>(token: ServiceToken<T>): T {
    return this.provider.resolve(token);
  }

  createScope(): ServiceScope {
    return this.provider.createScope();
  }
}

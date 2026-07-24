import { BootstrapTokens } from "@server/bootstrap/tokens";
import type {
  ServiceFactory,
  ServiceRegistry,
  ServiceToken,
} from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";

export interface StartupValidationResult {
  valid: boolean;
  errors: readonly string[];
}

const REQUIRED_TOKENS: readonly ServiceToken[] = Object.freeze([
  InfrastructureTokens.Configuration,
  InfrastructureTokens.Logger,
  InfrastructureTokens.Clock,
  InfrastructureTokens.IdGenerator,
  InfrastructureTokens.EventBus,
  InfrastructureTokens.UnitOfWork,
  InfrastructureTokens.TransactionManager,
  InfrastructureTokens.ProductRepository,
  InfrastructureTokens.SellerRepository,
  InfrastructureTokens.CatalogRepository,
  InfrastructureTokens.CategoryRepository,
  InfrastructureTokens.OrderRepository,
  InfrastructureTokens.DomainEventDispatcher,
  InfrastructureTokens.CreateOrderUseCase,
  InfrastructureTokens.CreateProductUseCase,
  InfrastructureTokens.RegisterSellerUseCase,
  InfrastructureTokens.CreateCategoryUseCase,
  InfrastructureTokens.GetOrderUseCase,
  InfrastructureTokens.GetProductUseCase,
  InfrastructureTokens.GetSellerUseCase,
  InfrastructureTokens.GetCatalogUseCase,
  InfrastructureTokens.OrderApplicationService,
  InfrastructureTokens.ProductApplicationService,
  InfrastructureTokens.SellerApplicationService,
  InfrastructureTokens.CatalogApplicationService,
  BootstrapTokens.ApiLogger,
  BootstrapTokens.ProductController,
  BootstrapTokens.SellerController,
  BootstrapTokens.CatalogController,
  BootstrapTokens.OrderController,
  BootstrapTokens.ApiServer,
]);

/** Validates DI registrations before application startup. */
export class StartupValidator {
  constructor(private readonly registry: ServiceRegistry) {}

  validate(): StartupValidationResult {
    const errors: string[] = [];

    for (const token of REQUIRED_TOKENS) {
      if (!this.registry.has(token)) {
        errors.push(`Missing service registration: ${String(token)}`);
      }
    }

    if (errors.length > 0) {
      return Object.freeze({ valid: false, errors: Object.freeze([...errors]) });
    }

    const resolutionErrors = this.validateResolvableServices();
    errors.push(...resolutionErrors);

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze([...errors]),
    });
  }

  private validateResolvableServices(): string[] {
    const errors: string[] = [];
    const singletons = new Map<ServiceToken, unknown>();
    const resolving = new Set<ServiceToken>();

    const resolveToken = (token: ServiceToken): unknown => {
      if (resolving.has(token)) {
        throw new Error(`Circular dependency detected involving ${String(token)}`);
      }

      const registration = this.registry.getRegistration(token);
      if (!registration) {
        throw new Error(`Service not registered: ${String(token)}`);
      }

      if (registration.lifetime === "singleton") {
        const cached = singletons.get(token);
        if (cached) {
          return cached;
        }
      }

      resolving.add(token);
      try {
        const instance = registration.factory({
          resolve: <T>(dependencyToken: ServiceToken<T>) => resolveToken(dependencyToken) as T,
        });
        if (registration.lifetime === "singleton") {
          singletons.set(token, instance);
        }
        return instance;
      } finally {
        resolving.delete(token);
      }
    };

    for (const token of REQUIRED_TOKENS) {
      try {
        resolveToken(token);
      } catch (error) {
        errors.push(formatResolutionError(token, error));
      }
    }

    return errors;
  }
}

function formatResolutionError(token: ServiceToken, error: unknown): string {
  const reason = error instanceof Error ? error.message : String(error);
  return `Failed to resolve ${String(token)}: ${reason}`;
}

export type { ServiceFactory };

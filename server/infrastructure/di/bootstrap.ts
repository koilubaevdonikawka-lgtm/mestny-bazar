import { DomainEventDispatcher } from "@server/application/events";
import {
  CatalogApplicationService,
  CreateCategoryUseCase,
  CreateOrderUseCase,
  CreateProductUseCase,
  GetCatalogUseCase,
  GetOrderUseCase,
  GetProductUseCase,
  GetSellerUseCase,
  OrderApplicationService,
  ProductApplicationService,
  RegisterSellerUseCase,
  SellerApplicationService,
} from "@server/application";
import type {
  ICatalogRepository,
  ICategoryRepository,
  IEventBus,
  IIdGenerator,
  IOrderRepository,
  IProductRepository,
  ISellerRepository,
  ITransactionManager,
} from "@server/application/ports";
import { ConfigurationProvider } from "@server/infrastructure/configuration";
import { SystemClock } from "@server/infrastructure/clock";
import {
  DependencyResolver,
  ServiceProvider,
  ServiceRegistry,
} from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { InMemoryEventBus } from "@server/infrastructure/event-bus";
import { UuidGenerator } from "@server/infrastructure/id-generator";
import { ConsoleLogger, StructuredLogger } from "@server/infrastructure/logging";
import {
  InMemoryCatalogRepository,
  InMemoryCategoryRepository,
  InMemoryOrderRepository,
  InMemoryProductRepository,
  InMemorySellerRepository,
} from "@server/infrastructure/repositories";
import {
  DefaultTransactionManager,
  DefaultUnitOfWork,
} from "@server/infrastructure/transactions";

export function createInfrastructureRegistry(
  config?: Partial<ConstructorParameters<typeof ConfigurationProvider>[0]>,
): ServiceRegistry {
  const registry = new ServiceRegistry();

  registry.registerSingleton(InfrastructureTokens.Configuration, () =>
    new ConfigurationProvider(config),
  );

  registry.registerSingleton(InfrastructureTokens.Logger, () =>
    new StructuredLogger(new ConsoleLogger("marketplace"), {
      layer: "infrastructure",
    }),
  );

  registry.registerSingleton(InfrastructureTokens.Clock, () => new SystemClock());
  registry.registerSingleton(InfrastructureTokens.IdGenerator, () => new UuidGenerator());
  registry.registerSingleton(InfrastructureTokens.EventBus, () => new InMemoryEventBus());
  registry.registerSingleton(InfrastructureTokens.UnitOfWork, () => new DefaultUnitOfWork());
  registry.registerSingleton(
    InfrastructureTokens.TransactionManager,
    (provider) => new DefaultTransactionManager(provider.resolve(InfrastructureTokens.UnitOfWork)),
  );

  registry.registerSingleton(
    InfrastructureTokens.ProductRepository,
    () => new InMemoryProductRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.SellerRepository,
    () => new InMemorySellerRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.CatalogRepository,
    () => new InMemoryCatalogRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.CategoryRepository,
    () => new InMemoryCategoryRepository(),
  );
  registry.registerSingleton(
    InfrastructureTokens.OrderRepository,
    () => new InMemoryOrderRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.DomainEventDispatcher,
    (provider) =>
      new DomainEventDispatcher(provider.resolve<IEventBus>(InfrastructureTokens.EventBus)),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateOrderUseCase,
    (provider) =>
      new CreateOrderUseCase(
        provider.resolve<IOrderRepository>(InfrastructureTokens.OrderRepository),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateProductUseCase,
    (provider) =>
      new CreateProductUseCase(
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.RegisterSellerUseCase,
    (provider) =>
      new RegisterSellerUseCase(
        provider.resolve<ISellerRepository>(InfrastructureTokens.SellerRepository),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CreateCategoryUseCase,
    (provider) =>
      new CreateCategoryUseCase(
        provider.resolve<ICategoryRepository>(InfrastructureTokens.CategoryRepository),
        provider.resolve<ICatalogRepository>(InfrastructureTokens.CatalogRepository),
        provider.resolve<ITransactionManager>(InfrastructureTokens.TransactionManager),
        provider.resolve(InfrastructureTokens.DomainEventDispatcher),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.GetOrderUseCase,
    (provider) =>
      new GetOrderUseCase(provider.resolve<IOrderRepository>(InfrastructureTokens.OrderRepository)),
  );

  registry.registerTransient(
    InfrastructureTokens.GetProductUseCase,
    (provider) =>
      new GetProductUseCase(
        provider.resolve<IProductRepository>(InfrastructureTokens.ProductRepository),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.GetSellerUseCase,
    (provider) =>
      new GetSellerUseCase(provider.resolve<ISellerRepository>(InfrastructureTokens.SellerRepository)),
  );

  registry.registerTransient(
    InfrastructureTokens.GetCatalogUseCase,
    (provider) =>
      new GetCatalogUseCase(
        provider.resolve<ICatalogRepository>(InfrastructureTokens.CatalogRepository),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.OrderApplicationService,
    (provider) =>
      new OrderApplicationService(
        provider.resolve(InfrastructureTokens.CreateOrderUseCase),
        provider.resolve(InfrastructureTokens.GetOrderUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.ProductApplicationService,
    (provider) =>
      new ProductApplicationService(
        provider.resolve(InfrastructureTokens.CreateProductUseCase),
        provider.resolve(InfrastructureTokens.GetProductUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.SellerApplicationService,
    (provider) =>
      new SellerApplicationService(
        provider.resolve(InfrastructureTokens.RegisterSellerUseCase),
        provider.resolve(InfrastructureTokens.GetSellerUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CatalogApplicationService,
    (provider) =>
      new CatalogApplicationService(
        provider.resolve(InfrastructureTokens.CreateCategoryUseCase),
        provider.resolve(InfrastructureTokens.GetCatalogUseCase),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  return registry;
}

export function createInfrastructureProvider(
  config?: Partial<ConstructorParameters<typeof ConfigurationProvider>[0]>,
): ServiceProvider {
  return new ServiceProvider(createInfrastructureRegistry(config));
}

export function createInfrastructureResolver(
  config?: Partial<ConstructorParameters<typeof ConfigurationProvider>[0]>,
): DependencyResolver {
  return new DependencyResolver(createInfrastructureProvider(config));
}

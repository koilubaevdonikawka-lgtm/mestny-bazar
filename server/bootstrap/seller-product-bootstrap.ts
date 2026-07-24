import type { IProductStore } from "@server/application/modules/product/product/contracts";
import type {
  InventoryModule,
  MarketplaceModule,
  ModerationModule,
  NotificationModule,
  PricingModule,
  ProductModule,
  SellerModule,
} from "@server/application/modules";
import {
  ApproveProductUseCase,
  ArchiveProductUseCase,
  ChangeInventoryUseCase,
  ChangePriceUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetSellerProductsUseCase,
  PublishProductUseCase,
  RejectProductUseCase,
  SellerProductApplicationService,
  SellerProductManagementService,
  SubmitForModerationUseCase,
  UnpublishProductUseCase,
  UpdateProductUseCase,
  UploadProductImagesUseCase,
} from "@server/application/seller-product";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";

/** Registers seller product management services and use cases. */
export function registerSellerProductApplication(registry: ServiceRegistry): void {
  registry.registerTransient(InfrastructureTokens.SellerProductManagementService, (provider) =>
    new SellerProductManagementService(
      provider.resolve<ProductModule>(BootstrapTokens.ProductModule),
      provider.resolve<IProductStore>(InfrastructureTokens.ProductStore),
      provider.resolve<SellerModule>(BootstrapTokens.SellerModule),
      provider.resolve<PricingModule>(BootstrapTokens.PricingModule),
      provider.resolve<InventoryModule>(BootstrapTokens.InventoryModule),
      provider.resolve<ModerationModule>(BootstrapTokens.ModerationModule),
      provider.resolve<MarketplaceModule>(BootstrapTokens.MarketplaceModule),
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CreateSellerProductUseCase, (provider) =>
    new CreateProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UpdateSellerProductUseCase, (provider) =>
    new UpdateProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.DeleteSellerProductUseCase, (provider) =>
    new DeleteProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UploadProductImagesUseCase, (provider) =>
    new UploadProductImagesUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ChangeProductPriceUseCase, (provider) =>
    new ChangePriceUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ChangeProductInventoryUseCase, (provider) =>
    new ChangeInventoryUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SubmitForModerationUseCase, (provider) =>
    new SubmitForModerationUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ApproveProductUseCase, (provider) =>
    new ApproveProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.RejectProductUseCase, (provider) =>
    new RejectProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.PublishSellerProductUseCase, (provider) =>
    new PublishProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UnpublishSellerProductUseCase, (provider) =>
    new UnpublishProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ArchiveSellerProductUseCase, (provider) =>
    new ArchiveProductUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetSellerProductsUseCase, (provider) =>
    new GetSellerProductsUseCase(
      provider.resolve<SellerProductManagementService>(
        InfrastructureTokens.SellerProductManagementService,
      ),
    ),
  );

  registry.registerTransient(InfrastructureTokens.SellerProductApplicationService, (provider) =>
    new SellerProductApplicationService(
      provider.resolve<CreateProductUseCase>(InfrastructureTokens.CreateSellerProductUseCase),
      provider.resolve<UpdateProductUseCase>(InfrastructureTokens.UpdateSellerProductUseCase),
      provider.resolve<DeleteProductUseCase>(InfrastructureTokens.DeleteSellerProductUseCase),
      provider.resolve<UploadProductImagesUseCase>(InfrastructureTokens.UploadProductImagesUseCase),
      provider.resolve<ChangePriceUseCase>(InfrastructureTokens.ChangeProductPriceUseCase),
      provider.resolve<ChangeInventoryUseCase>(InfrastructureTokens.ChangeProductInventoryUseCase),
      provider.resolve<SubmitForModerationUseCase>(InfrastructureTokens.SubmitForModerationUseCase),
      provider.resolve<ApproveProductUseCase>(InfrastructureTokens.ApproveProductUseCase),
      provider.resolve<RejectProductUseCase>(InfrastructureTokens.RejectProductUseCase),
      provider.resolve<PublishProductUseCase>(InfrastructureTokens.PublishSellerProductUseCase),
      provider.resolve<UnpublishProductUseCase>(InfrastructureTokens.UnpublishSellerProductUseCase),
      provider.resolve<ArchiveProductUseCase>(InfrastructureTokens.ArchiveSellerProductUseCase),
      provider.resolve<GetSellerProductsUseCase>(InfrastructureTokens.GetSellerProductsUseCase),
    ),
  );
}

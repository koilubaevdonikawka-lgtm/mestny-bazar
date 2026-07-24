import { getApplicationProvider } from "@server/bootstrap/application-provider";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { PurchaseApplicationService } from "@server/application/purchase/services/purchase-application.service";
import type {
  AddToCartInput,
  BrowseCatalogInput,
  CheckoutInput,
  CompletePurchaseInput,
  CompletePurchaseResult,
  PayOrderInput,
  UpdateCartInput,
} from "@server/application/purchase/dto";

function resolvePurchase(): PurchaseApplicationService {
  return getApplicationProvider().resolve<PurchaseApplicationService>(
    InfrastructureTokens.PurchaseApplicationService,
  );
}

export async function executeBrowseCatalog(input: BrowseCatalogInput = {}) {
  return (await resolvePurchase().browseCatalog(input)).value;
}

export async function executeViewProduct(productId: string) {
  return (await resolvePurchase().viewProduct(productId)).value;
}

export async function executeAddToCart(input: AddToCartInput) {
  return (await resolvePurchase().addToCart(input)).value;
}

export async function executeUpdateCart(input: UpdateCartInput) {
  return (await resolvePurchase().updateCart(input)).value;
}

export async function executePurchaseCheckout(input: CheckoutInput) {
  return (await resolvePurchase().checkout(input)).value;
}

export async function executePurchaseCreateOrder(sessionId: string) {
  return (await resolvePurchase().createOrder(sessionId)).value;
}

export async function executePayOrder(input: PayOrderInput) {
  return (await resolvePurchase().payOrder(input)).value;
}

export async function executeCompletePurchase(
  input: CompletePurchaseInput,
): Promise<CompletePurchaseResult> {
  return resolvePurchase().completePurchase(input);
}

export function resolvePurchaseOrderModule() {
  return getApplicationProvider().resolve(BootstrapTokens.OrderModule);
}

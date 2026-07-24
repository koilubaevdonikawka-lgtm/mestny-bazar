export { OrderLifecycleScenario, OrderLifecycleScenarioId } from "./order-lifecycle.scenario";
export { SellerProductScenario, SellerProductScenarioId } from "./seller-product.scenario";
export { CustomerManagementScenario, CustomerManagementScenarioId } from "./customer-management.scenario";
export { PurchaseScenario, PurchaseScenarioId } from "./purchase.scenario";
export { CheckoutScenario, CheckoutScenarioId } from "./checkout.scenario";
export { PaymentScenario, PaymentScenarioId } from "./payment.scenario";
export { MarketplaceScenario, MarketplaceScenarioId } from "./marketplace.scenario";
export { ModerationScenario, ModerationScenarioId } from "./moderation.scenario";
export { SupportScenario, SupportScenarioId } from "./support.scenario";
export { AnalyticsScenario, AnalyticsScenarioId } from "./analytics.scenario";
export { AdministrationScenario, AdministrationScenarioId } from "./administration.scenario";
export { AIScenario, AIScenarioId } from "./ai.scenario";

import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import { OrderLifecycleScenario } from "./order-lifecycle.scenario";
import { SellerProductScenario } from "./seller-product.scenario";
import { CustomerManagementScenario } from "./customer-management.scenario";
import { PurchaseScenario } from "./purchase.scenario";
import { CheckoutScenario } from "./checkout.scenario";
import { PaymentScenario } from "./payment.scenario";
import { MarketplaceScenario } from "./marketplace.scenario";
import { ModerationScenario } from "./moderation.scenario";
import { SupportScenario } from "./support.scenario";
import { AnalyticsScenario } from "./analytics.scenario";
import { AdministrationScenario } from "./administration.scenario";
import { AIScenario } from "./ai.scenario";

/** Registers all built-in end-to-end scenarios. */
export function createDefaultScenarios(): readonly ITestScenario[] {
  return Object.freeze([
    new OrderLifecycleScenario(),
    new SellerProductScenario(),
    new CustomerManagementScenario(),
    new PurchaseScenario(),
    new CheckoutScenario(),
    new PaymentScenario(),
    new MarketplaceScenario(),
    new ModerationScenario(),
    new SupportScenario(),
    new AnalyticsScenario(),
    new AdministrationScenario(),
    new AIScenario(),
  ]);
}

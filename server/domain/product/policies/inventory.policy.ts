import type { ProductPolicySnapshot } from "@server/domain/product/policies/publication.policy";
import { isTerminalProductStatus } from "@server/domain/product/status/product-status";

/** Stock mutation permissions. */
export class InventoryPolicy {
  canChangeInventory(snapshot: ProductPolicySnapshot): boolean {
    return !isTerminalProductStatus(snapshot.status);
  }
}

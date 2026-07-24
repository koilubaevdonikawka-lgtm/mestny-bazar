import type { CategoryPolicySnapshot } from "@server/domain/catalog/policies/category-visibility.policy";
import { CategoryLifecycleStatus as Status } from "@server/domain/catalog/status/category-status";
import { isTerminalCategoryStatus } from "@server/domain/catalog/status/category-status";

/** Category publication lifecycle permissions. */
export class CategoryPublishingPolicy {
  canPublish(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status === Status.Draft || snapshot.status === Status.Hidden;
  }

  canHide(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status === Status.Visible || snapshot.status === Status.Draft;
  }

  canArchive(snapshot: CategoryPolicySnapshot): boolean {
    return !isTerminalCategoryStatus(snapshot.status);
  }

  canRestore(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status === Status.Archived;
  }

  canRename(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status !== Status.Archived;
  }

  canMove(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status !== Status.Archived;
  }

  canChangeSortOrder(snapshot: CategoryPolicySnapshot): boolean {
    return snapshot.status !== Status.Archived;
  }
}

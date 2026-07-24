import type { CartItem } from "@server/application/modules/cart/cart/models";
import type { CartTotals } from "@server/application/modules/cart/cart/models";
import type { FavoriteItem } from "@server/application/modules/favorites/favorites/models";

/** Cart persistence record stored in snapshot tables. */
export interface CartStoreRecord {
  readonly id: string;
  readonly customerId: string;
  readonly items: readonly CartItem[];
  readonly totals: CartTotals;
  readonly updatedAt: string;
}

/** Favorites persistence record stored in snapshot tables. */
export interface FavoritesStoreRecord {
  readonly id: string;
  readonly userId: string;
  readonly items: readonly FavoriteItem[];
  readonly updatedAt: string;
}

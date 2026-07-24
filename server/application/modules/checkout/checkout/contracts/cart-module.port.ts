import type { CartModule } from "@server/application/modules/cart/cart/api/cart.module";

/** Public cart module contract used by checkout orchestration. */
export type ICartModule = Pick<
  CartModule,
  "getCart" | "clearCart"
>;

import type {
  CartDTO,
  CartLineIdentifier,
  CartLineInput,
  CartLineStatus,
  CartLineValidationResult,
  CartValidationResult,
} from "@shared/contracts/cart";
import type { ProductDTO } from "@shared/contracts/catalog";
import type { CartLineUpsertInput, ICartRepository } from "@server/ports/cart.repository";
import type { IProductRepository } from "@server/ports/product.repository";

function toUpsertInput(line: CartLineInput): CartLineUpsertInput {
  return {
    productId: line.productId,
    productSlug: line.productSlug,
    quantity: line.quantity,
    name: line.snapshot.name,
    price: line.snapshot.price,
    currency: line.snapshot.currency ?? "KGS",
    imageUrl: line.snapshot.imageUrl ?? null,
  };
}

export class CartService {
  constructor(
    private readonly products: IProductRepository,
    private readonly carts: ICartRepository,
  ) {}

  /**
   * Never trusts client-held prices: re-fetches every line's product from
   * IProductRepository (the same repository CheckoutService.resolveLineItems
   * uses) and reports price/stock/existence drift instead of throwing, so the
   * cart UI can surface it before the customer reaches checkout.
   */
  async validate(lines: CartLineInput[]): Promise<CartValidationResult> {
    const { idMap, slugMap } = await this.lookupProducts(lines);

    const resultLines: CartLineValidationResult[] = lines.map((line) => {
      const product = this.resolveProduct(line, idMap, slugMap);
      const base = {
        productId: line.productId ?? null,
        productSlug: line.productSlug ?? null,
        quantity: line.quantity,
      };

      if (!product) {
        return { ...base, status: "not_found" as CartLineStatus, product: null };
      }
      if (!product.inStock || product.stock < line.quantity) {
        return { ...base, status: "out_of_stock" as CartLineStatus, product };
      }
      if (product.price !== line.snapshot.price) {
        return { ...base, status: "price_changed" as CartLineStatus, product };
      }
      return { ...base, status: "ok" as CartLineStatus, product };
    });

    return { lines: resultLines, hasChanges: resultLines.some((line) => line.status !== "ok") };
  }

  async getCart(userId: string): Promise<CartDTO> {
    return this.carts.getByUserId(userId);
  }

  async addItem(userId: string, line: CartLineInput): Promise<CartDTO> {
    return this.carts.upsertItems(userId, [toUpsertInput(line)]);
  }

  async updateQuantity(
    userId: string,
    identifier: CartLineIdentifier,
    quantity: number,
  ): Promise<CartDTO> {
    if (quantity <= 0) return this.carts.removeItem(userId, identifier);
    return this.carts.updateQuantity(userId, identifier, quantity);
  }

  async removeItem(userId: string, identifier: CartLineIdentifier): Promise<CartDTO> {
    return this.carts.removeItem(userId, identifier);
  }

  async clear(userId: string): Promise<void> {
    return this.carts.clear(userId);
  }

  /** Called once right after sign-in to fold the local guest cart into the server cart. */
  async mergeGuestItems(userId: string, lines: CartLineInput[]): Promise<CartDTO> {
    if (!lines.length) return this.carts.getByUserId(userId);
    return this.carts.upsertItems(userId, lines.map(toUpsertInput));
  }

  private resolveProduct(
    line: CartLineInput,
    idMap: Map<string, ProductDTO>,
    slugMap: Map<string, ProductDTO>,
  ): ProductDTO | undefined {
    if (line.productId?.trim()) return idMap.get(line.productId.trim());
    if (line.productSlug?.trim()) return slugMap.get(line.productSlug.trim());
    return undefined;
  }

  private async lookupProducts(
    lines: CartLineIdentifier[],
  ): Promise<{ idMap: Map<string, ProductDTO>; slugMap: Map<string, ProductDTO> }> {
    const ids = [...new Set(lines.map((l) => l.productId?.trim()).filter((v): v is string => !!v))];
    const slugs = [
      ...new Set(lines.map((l) => l.productSlug?.trim()).filter((v): v is string => !!v)),
    ];

    const [byId, bySlug] = await Promise.all([
      ids.length ? this.products.getManyByIds(ids) : Promise.resolve([]),
      slugs.length ? this.products.getManyBySlugs(slugs) : Promise.resolve([]),
    ]);

    return {
      idMap: new Map(byId.map((product) => [product.id, product])),
      slugMap: new Map(bySlug.map((product) => [product.slug, product])),
    };
  }
}

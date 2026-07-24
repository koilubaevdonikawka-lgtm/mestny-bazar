/** Seller shop store owned by the Seller capability module. */
export interface SellerStore {
  readonly id: string;
  readonly sellerId: string;
  readonly name: string;
  readonly address: string | null;
}

export function createSellerStore(input: {
  id: string;
  sellerId: string;
  name: string;
  address?: string | null;
}): SellerStore {
  return Object.freeze({
    id: input.id.trim(),
    sellerId: input.sellerId.trim(),
    name: input.name.trim(),
    address: input.address?.trim() || null,
  });
}

export function updateSellerStore(
  store: SellerStore,
  input: {
    name: string;
    address?: string | null;
  },
): SellerStore {
  return Object.freeze({
    ...store,
    name: input.name.trim(),
    address: input.address === undefined ? store.address : input.address?.trim() || null,
  });
}

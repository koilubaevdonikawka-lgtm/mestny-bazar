/** Seller profile owned by the Seller capability module. */
export interface SellerProfile {
  readonly displayName: string;
  readonly email: string;
  readonly phone: string;
  readonly description: string | null;
}

export function createSellerProfile(input: {
  displayName: string;
  email: string;
  phone: string;
  description?: string | null;
}): SellerProfile {
  return Object.freeze({
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    description: input.description?.trim() || null,
  });
}

export function updateSellerProfile(
  profile: SellerProfile,
  input: {
    displayName: string;
    email: string;
    phone: string;
    description?: string | null;
  },
): SellerProfile {
  return Object.freeze({
    displayName: input.displayName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    description: input.description?.trim() || null,
  });
}

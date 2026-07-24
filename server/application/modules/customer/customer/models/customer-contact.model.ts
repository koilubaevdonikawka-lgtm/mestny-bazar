/** Customer contact details owned by the Customer capability module. */
export interface CustomerContact {
  readonly phone: string;
  readonly email: string | null;
}

export function createCustomerContact(input: {
  phone: string;
  email?: string | null;
}): CustomerContact {
  return Object.freeze({
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
  });
}

export function withCustomerContactPhone(contact: CustomerContact, phone: string): CustomerContact {
  return Object.freeze({
    ...contact,
    phone: phone.trim(),
  });
}

export function withCustomerContactEmail(
  contact: CustomerContact,
  email: string | null,
): CustomerContact {
  return Object.freeze({
    ...contact,
    email: email?.trim() || null,
  });
}

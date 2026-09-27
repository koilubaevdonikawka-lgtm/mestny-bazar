export interface GuestOrderContactRow {
  phone: string;
  createdAt: string;
}

export interface IGuestCustomerRepository {
  /** Most recent guest (user_id IS NULL) orders first, at most `maxRows` rows. */
  listRecentGuestOrderContacts(maxRows: number): Promise<GuestOrderContactRow[]>;
}

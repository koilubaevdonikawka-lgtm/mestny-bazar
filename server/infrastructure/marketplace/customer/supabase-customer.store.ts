import type { ICustomerStore } from "@server/application/modules/customer/customer/contracts";
import type {
  Customer,
  CustomerAddress,
} from "@server/application/modules/customer/customer/models";
import {
  CustomerAddressMapper,
  CustomerMapper,
} from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed customer store using JSON snapshot persistence. */
export class SupabaseCustomerStore implements ICustomerStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveCustomer(customer: Customer): Promise<void> {
    const row = CustomerMapper.toSnapshotRow(customer);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customers}.upsert`,
      await this.customerTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateCustomer(customer: Customer): Promise<void> {
    await this.saveCustomer(customer);
  }

  async findCustomerById(customerId: string): Promise<Customer | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customers}.select`,
      await this.customerTable().select("id, snapshot, updated_at").eq("id", customerId).maybeSingle(),
    );
    return CustomerMapper.fromSnapshotRow(data as SnapshotRow<Customer> | null);
  }

  async saveAddress(address: CustomerAddress): Promise<void> {
    const row = CustomerAddressMapper.toSnapshotRow(address);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customerAddresses}.upsert`,
      await this.addressTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateAddress(address: CustomerAddress): Promise<void> {
    await this.saveAddress(address);
  }

  async findAddressById(addressId: string): Promise<CustomerAddress | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customerAddresses}.select`,
      await this.addressTable()
        .select("id, customer_id, snapshot, updated_at")
        .eq("id", addressId)
        .maybeSingle(),
    );
    return CustomerAddressMapper.fromSnapshotRow(
      data as (SnapshotRow<CustomerAddress> & { customer_id?: string }) | null,
    );
  }

  async findAddressesByCustomerId(customerId: string): Promise<readonly CustomerAddress[]> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customerAddresses}.selectByCustomer`,
      await this.addressTable()
        .select("id, customer_id, snapshot, updated_at")
        .eq("customer_id", customerId),
    ) as Array<SnapshotRow<CustomerAddress> & { customer_id: string }>;

    return Object.freeze(
      rows
        .map((row) => CustomerAddressMapper.fromSnapshotRow(row))
        .filter((address): address is CustomerAddress => address !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  async findDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    const addresses = await this.findAddressesByCustomerId(customerId);
    return addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  }

  async deleteAddress(addressId: string): Promise<void> {
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.customerAddresses}.delete`,
      await this.addressTable().delete().eq("id", addressId),
    );
  }

  private customerTable() {
    return this.table(MarketplaceSnapshotTables.customers);
  }

  private addressTable() {
    return this.table(MarketplaceSnapshotTables.customerAddresses);
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}

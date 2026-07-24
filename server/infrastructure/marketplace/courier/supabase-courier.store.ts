import type { ICourierStore } from "@server/application/modules/courier/courier/contracts";
import type {
  Courier,
  CourierAssignment,
  DeliveryRoute,
} from "@server/application/modules/courier/courier/models";
import {
  CourierAssignmentMapper,
  CourierMapper,
  DeliveryRouteMapper,
} from "@server/infrastructure/marketplace/mappers";
import { MarketplaceSnapshotTables } from "@server/infrastructure/marketplace/shared";
import type { ISupabaseClientProvider } from "@server/infrastructure/supabase/client";
import type { SupabaseConfiguration } from "@server/infrastructure/supabase/configuration";
import { assertSupabaseSuccess, type SnapshotRow } from "@server/infrastructure/supabase/shared";

/** Supabase-backed courier store using JSON snapshot persistence. */
export class SupabaseCourierStore implements ICourierStore {
  constructor(
    private readonly clientProvider: ISupabaseClientProvider,
    private readonly configuration: SupabaseConfiguration,
  ) {}

  async saveCourier(courier: Courier): Promise<void> {
    const row = CourierMapper.toSnapshotRow(courier);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.couriers}.upsert`,
      await this.courierTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateCourier(courier: Courier): Promise<void> {
    await this.saveCourier(courier);
  }

  async findCourierById(courierId: string): Promise<Courier | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.couriers}.select`,
      await this.courierTable().select("id, snapshot, updated_at").eq("id", courierId).maybeSingle(),
    );
    return CourierMapper.fromSnapshotRow(data as SnapshotRow<Courier> | null);
  }

  async saveAssignment(assignment: CourierAssignment): Promise<void> {
    const row = CourierAssignmentMapper.toSnapshotRow(assignment);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.courierAssignments}.upsert`,
      await this.assignmentTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateAssignment(assignment: CourierAssignment): Promise<void> {
    await this.saveAssignment(assignment);
  }

  async findAssignmentById(assignmentId: string): Promise<CourierAssignment | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.courierAssignments}.select`,
      await this.assignmentTable()
        .select("id, order_id, courier_id, snapshot, updated_at")
        .eq("id", assignmentId)
        .maybeSingle(),
    );
    return CourierAssignmentMapper.fromSnapshotRow(
      data as (SnapshotRow<CourierAssignment> & { order_id?: string; courier_id?: string }) | null,
    );
  }

  async findAssignmentsByOrderId(orderId: string): Promise<readonly CourierAssignment[]> {
    const rows = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.courierAssignments}.selectByOrder`,
      await this.assignmentTable()
        .select("id, order_id, courier_id, snapshot, updated_at")
        .eq("order_id", orderId),
    ) as Array<SnapshotRow<CourierAssignment> & { order_id: string; courier_id: string }>;

    return Object.freeze(
      rows
        .map((row) => CourierAssignmentMapper.fromSnapshotRow(row))
        .filter((assignment): assignment is CourierAssignment => assignment !== null)
        .sort((left, right) => right.assignedAt.localeCompare(left.assignedAt)),
    );
  }

  async saveRoute(route: DeliveryRoute): Promise<void> {
    const row = DeliveryRouteMapper.toSnapshotRow(route);
    assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.deliveryRoutes}.upsert`,
      await this.routeTable().upsert(row, { onConflict: "id" }),
    );
  }

  async updateRoute(route: DeliveryRoute): Promise<void> {
    await this.saveRoute(route);
  }

  async findRouteByAssignmentId(assignmentId: string): Promise<DeliveryRoute | null> {
    const data = assertSupabaseSuccess(
      `${MarketplaceSnapshotTables.deliveryRoutes}.select`,
      await this.routeTable()
        .select("id, assignment_id, order_id, snapshot, updated_at")
        .eq("assignment_id", assignmentId)
        .maybeSingle(),
    );
    return DeliveryRouteMapper.fromSnapshotRow(
      data as (SnapshotRow<DeliveryRoute> & { assignment_id?: string; order_id?: string }) | null,
    );
  }

  private courierTable() {
    return this.table(MarketplaceSnapshotTables.couriers);
  }

  private assignmentTable() {
    return this.table(MarketplaceSnapshotTables.courierAssignments);
  }

  private routeTable() {
    return this.table(MarketplaceSnapshotTables.deliveryRoutes);
  }

  private table(tableName: string) {
    const client = this.clientProvider.getServiceClient();
    if (this.configuration.schema === "public") {
      return client.from(tableName);
    }
    return client.schema(this.configuration.schema).from(tableName);
  }
}

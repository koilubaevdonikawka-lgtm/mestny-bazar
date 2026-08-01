import { describe, expect, it } from "vitest";
import {
  fromDbOrderStatus,
  mapOrderRowToDto,
  toDbOrderStatus,
} from "@server/adapters/supabase/order.mapper";
import { OrderStatus } from "@shared/contracts/order";

describe("order status DB mapping", () => {
  it("round-trips every domain status through the DB representation unchanged", () => {
    for (const status of Object.values(OrderStatus)) {
      expect(fromDbOrderStatus(toDbOrderStatus(status))).toBe(status);
    }
  });

  it("maps every domain status to a distinct DB value (no collapsing)", () => {
    const dbValues = Object.values(OrderStatus).map(toDbOrderStatus);
    expect(new Set(dbValues).size).toBe(dbValues.length);
  });
});

describe("mapOrderRowToDto", () => {
  function fakeRow() {
    return {
      id: "order-1",
      order_number: 42,
      status: "preparing" as const,
      payment_status: "paid" as const,
      subtotal: 100,
      delivery_fee: 20,
      total: 120,
      currency: "KGS",
      customer_name: "Buyer",
      customer_phone: "996700000000",
      address_snapshot: "addr",
      notes: null,
      finik_payment_url: null,
      paid_at: null,
      created_at: "2026-01-01T00:00:00.000Z",
      assigned_courier_id: null,
    };
  }

  it("maps snake_case DB fields to the camelCase OrderDTO shape", () => {
    const dto = mapOrderRowToDto(fakeRow(), [], "CASH");

    expect(dto).toMatchObject({
      id: "order-1",
      orderNumber: 42,
      status: OrderStatus.ASSEMBLING,
      paymentStatus: "paid",
      paymentMethod: "CASH",
      customerName: "Buyer",
      customerPhone: "996700000000",
      addressSnapshot: "addr",
      paymentUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      paidAt: null,
    });
  });

  it("coerces subtotal/deliveryFee/total to numbers even when Postgres returns numeric columns as strings", () => {
    const row = {
      ...fakeRow(),
      subtotal: "100.50" as unknown as number,
      delivery_fee: "20.25" as unknown as number,
      total: "120.75" as unknown as number,
    };

    const dto = mapOrderRowToDto(row, [], "CASH");

    expect(dto.subtotal).toBe(100.5);
    expect(dto.deliveryFee).toBe(20.25);
    expect(dto.total).toBe(120.75);
  });

  it("maps line items, coercing unitPrice/lineTotal to numbers", () => {
    const dto = mapOrderRowToDto(
      fakeRow(),
      [
        {
          id: "item-1",
          product_id: "prod-1",
          product_name: "Apples",
          product_image_url: "https://example.com/a.jpg",
          quantity: 2,
          unit_price: "50.25" as unknown as number,
          line_total: "100.50" as unknown as number,
        },
      ],
      "CASH",
    );

    expect(dto.items).toEqual([
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Apples",
        productImageUrl: "https://example.com/a.jpg",
        quantity: 2,
        unitPrice: 50.25,
        lineTotal: 100.5,
      },
    ]);
  });

  it("preserves null productId and productImageUrl on line items", () => {
    const dto = mapOrderRowToDto(
      fakeRow(),
      [
        {
          id: "item-1",
          product_id: null,
          product_name: "Custom item",
          product_image_url: null,
          quantity: 1,
          unit_price: 10,
          line_total: 10,
        },
      ],
      "CASH",
    );

    expect(dto.items[0]?.productId).toBeNull();
    expect(dto.items[0]?.productImageUrl).toBeNull();
  });

  it("passes through notes, paymentUrl and paidAt when set", () => {
    const row = {
      ...fakeRow(),
      notes: "Leave at the door",
      finik_payment_url: "https://finik.example/pay/1",
      paid_at: "2026-01-02T00:00:00.000Z",
    };

    const dto = mapOrderRowToDto(row, [], "ONLINE");

    expect(dto.notes).toBe("Leave at the door");
    expect(dto.paymentUrl).toBe("https://finik.example/pay/1");
    expect(dto.paidAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("maps assigned_courier_id, including the not-yet-assigned null case", () => {
    expect(mapOrderRowToDto(fakeRow(), [], "CASH").assignedCourierId).toBeNull();

    const assigned = mapOrderRowToDto(
      { ...fakeRow(), assigned_courier_id: "courier-1" },
      [],
      "CASH",
    );
    expect(assigned.assignedCourierId).toBe("courier-1");
  });
});

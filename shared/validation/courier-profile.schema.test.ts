import { describe, expect, it } from "vitest";
import {
  bulkSetCourierProfileStatusRequestSchema,
  createCourierProfileRequestSchema,
  setCourierProfileStatusRequestSchema,
  updateCourierProfileRequestSchema,
} from "./courier-profile.schema";

const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("createCourierProfileRequestSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createCourierProfileRequestSchema.parse({
      userId: VALID_UUID,
      lastName: "Иванов",
      firstName: "Иван",
      phone: "+996700000000",
    });
    expect(result).toMatchObject({ lastName: "Иванов", firstName: "Иван" });
  });

  it("rejects a non-uuid userId", () => {
    expect(() =>
      createCourierProfileRequestSchema.parse({
        userId: "not-a-uuid",
        lastName: "Иванов",
        firstName: "Иван",
        phone: "+996700000000",
      }),
    ).toThrow();
  });

  it("rejects an empty lastName", () => {
    expect(() =>
      createCourierProfileRequestSchema.parse({
        userId: VALID_UUID,
        lastName: "",
        firstName: "Иван",
        phone: "+996700000000",
      }),
    ).toThrow();
  });

  it("rejects a phone shorter than 5 characters", () => {
    expect(() =>
      createCourierProfileRequestSchema.parse({
        userId: VALID_UUID,
        lastName: "Иванов",
        firstName: "Иван",
        phone: "123",
      }),
    ).toThrow();
  });

  it("rejects an invalid vehicleType", () => {
    expect(() =>
      createCourierProfileRequestSchema.parse({
        userId: VALID_UUID,
        lastName: "Иванов",
        firstName: "Иван",
        phone: "+996700000000",
        vehicleType: "SPACESHIP",
      }),
    ).toThrow();
  });

  it("rejects a non-uuid serviceZoneId", () => {
    expect(() =>
      createCourierProfileRequestSchema.parse({
        userId: VALID_UUID,
        lastName: "Иванов",
        firstName: "Иван",
        phone: "+996700000000",
        serviceZoneId: "not-a-uuid",
      }),
    ).toThrow();
  });
});

describe("updateCourierProfileRequestSchema", () => {
  it("requires a uuid userId", () => {
    expect(() => updateCourierProfileRequestSchema.parse({ userId: "bad" })).toThrow();
  });

  it("accepts a partial update", () => {
    const result = updateCourierProfileRequestSchema.parse({
      userId: VALID_UUID,
      phone: "+996700000001",
    });
    expect(result).toMatchObject({ userId: VALID_UUID, phone: "+996700000001" });
  });
});

describe("setCourierProfileStatusRequestSchema", () => {
  it("accepts ACTIVE/BLOCKED", () => {
    expect(
      setCourierProfileStatusRequestSchema.parse({ userId: VALID_UUID, status: "BLOCKED" }),
    ).toMatchObject({ status: "BLOCKED" });
  });

  it("rejects an unknown status", () => {
    expect(() =>
      setCourierProfileStatusRequestSchema.parse({ userId: VALID_UUID, status: "PAUSED" }),
    ).toThrow();
  });
});

describe("bulkSetCourierProfileStatusRequestSchema", () => {
  it("rejects an empty userIds array", () => {
    expect(() =>
      bulkSetCourierProfileStatusRequestSchema.parse({ userIds: [], status: "ACTIVE" }),
    ).toThrow();
  });

  it("accepts a non-empty userIds array", () => {
    const result = bulkSetCourierProfileStatusRequestSchema.parse({
      userIds: [VALID_UUID],
      status: "ACTIVE",
    });
    expect(result.userIds).toHaveLength(1);
  });
});

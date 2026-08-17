import { describe, expect, it } from "vitest";
import {
  assignRoleRequestSchema,
  createPermissionRequestSchema,
  createRoleRequestSchema,
  setRolePermissionsRequestSchema,
  updateRoleRequestSchema,
} from "./rbac.schema";

const VALID_UUID = "11111111-1111-1111-1111-111111111111";
const VALID_UUID_2 = "22222222-2222-2222-2222-222222222222";

describe("createRoleRequestSchema", () => {
  it("accepts a valid role name", () => {
    expect(createRoleRequestSchema.parse({ name: "Оператор" })).toMatchObject({
      name: "Оператор",
    });
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(() => createRoleRequestSchema.parse({ name: "A" })).toThrow();
  });
});

describe("updateRoleRequestSchema", () => {
  it("requires a uuid id", () => {
    expect(() => updateRoleRequestSchema.parse({ id: "not-a-uuid" })).toThrow();
  });
});

describe("createPermissionRequestSchema", () => {
  it("accepts a module/action pair", () => {
    const result = createPermissionRequestSchema.parse({ module: "couriers", action: "view" });
    expect(result).toEqual({ module: "couriers", action: "view" });
  });

  it("rejects an empty module", () => {
    expect(() => createPermissionRequestSchema.parse({ module: "", action: "view" })).toThrow();
  });

  it("rejects an empty action", () => {
    expect(() => createPermissionRequestSchema.parse({ module: "couriers", action: "" })).toThrow();
  });
});

describe("setRolePermissionsRequestSchema", () => {
  it("accepts an empty permissionIds array (revoking all permissions from a role)", () => {
    const result = setRolePermissionsRequestSchema.parse({ roleId: VALID_UUID, permissionIds: [] });
    expect(result.permissionIds).toEqual([]);
  });

  it("rejects a non-uuid permissionId", () => {
    expect(() =>
      setRolePermissionsRequestSchema.parse({ roleId: VALID_UUID, permissionIds: ["not-a-uuid"] }),
    ).toThrow();
  });
});

describe("assignRoleRequestSchema", () => {
  it("accepts a valid userId/roleId pair", () => {
    const result = assignRoleRequestSchema.parse({ userId: VALID_UUID, roleId: VALID_UUID_2 });
    expect(result).toEqual({ userId: VALID_UUID, roleId: VALID_UUID_2 });
  });

  it("rejects a non-uuid roleId", () => {
    expect(() =>
      assignRoleRequestSchema.parse({ userId: VALID_UUID, roleId: "not-a-uuid" }),
    ).toThrow();
  });
});

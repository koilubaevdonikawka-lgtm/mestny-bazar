/** Warehouse worker assigned to a picking task. */
export interface WarehouseWorker {
  readonly id: string;
  readonly name: string;
  readonly assignedAt: string;
}

export function createWarehouseWorker(input: {
  id: string;
  name: string;
}): WarehouseWorker {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    assignedAt: new Date().toISOString(),
  });
}

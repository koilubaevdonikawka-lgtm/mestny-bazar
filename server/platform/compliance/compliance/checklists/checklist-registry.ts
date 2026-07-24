import type { IChecklistRegistry } from "@server/platform/compliance/compliance/contracts";
import {
  createChecklistDescriptor,
  type ChecklistDescriptor,
  type ChecklistKind,
} from "@server/platform/compliance/compliance/models";

/** Registers compliance checklist metadata. */
export class ChecklistRegistry implements IChecklistRegistry {
  private readonly checklists = new Map<string, ChecklistDescriptor>();

  register(checklist: ChecklistDescriptor): ChecklistDescriptor {
    const stored = createChecklistDescriptor(checklist);
    this.checklists.set(stored.id, stored);
    return stored;
  }

  get(checklistId: string): ChecklistDescriptor | undefined {
    return this.checklists.get(checklistId.trim());
  }

  list(kind?: ChecklistKind): readonly ChecklistDescriptor[] {
    const values = [...this.checklists.values()];
    const filtered = kind ? values.filter((checklist) => checklist.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}

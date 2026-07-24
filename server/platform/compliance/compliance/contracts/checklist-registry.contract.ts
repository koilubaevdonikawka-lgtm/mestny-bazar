import type {
  ChecklistDescriptor,
  ChecklistKind,
} from "@server/platform/compliance/compliance/models";

/** Contract for compliance checklist registration. */
export interface IChecklistRegistry {
  register(checklist: ChecklistDescriptor): ChecklistDescriptor;
  get(checklistId: string): ChecklistDescriptor | undefined;
  list(kind?: ChecklistKind): readonly ChecklistDescriptor[];
}

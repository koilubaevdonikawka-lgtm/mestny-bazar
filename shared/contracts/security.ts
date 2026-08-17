export const SecurityItemStatus = {
  IMPLEMENTED: "IMPLEMENTED",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type SecurityItemStatus = (typeof SecurityItemStatus)[keyof typeof SecurityItemStatus];

export interface SecurityPerimeterItem {
  name: string;
  mechanism: string;
  status: SecurityItemStatus;
}

export interface SecurityGap {
  name: string;
  note: string;
}

export interface SecurityOverviewDTO {
  perimeter: SecurityPerimeterItem[];
  gaps: SecurityGap[];
}

export type CertificationStatus =
  | "draft"
  | "passed"
  | "conditional"
  | "failed"
  | "expired";

/** Issued compliance certificate metadata (no system state changes). */
export interface ComplianceCertificate {
  readonly id: string;
  readonly standardId: string;
  readonly status: CertificationStatus;
  readonly score: number;
  readonly issuedAt: string;
  readonly expiresAt?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createComplianceCertificate(input: {
  id?: string;
  standardId: string;
  status: CertificationStatus;
  score: number;
  expiresAt?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): ComplianceCertificate {
  return Object.freeze({
    id: input.id ?? `certificate-${Date.now()}`,
    standardId: input.standardId.trim(),
    status: input.status,
    score: input.score,
    issuedAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}

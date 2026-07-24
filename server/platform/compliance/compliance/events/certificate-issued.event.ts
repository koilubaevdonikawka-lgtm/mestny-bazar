import type { ComplianceCertificate } from "@server/platform/compliance/compliance/models";

export interface CertificateIssuedEvent {
  readonly type: "compliance.certificate.issued";
  readonly certificate: ComplianceCertificate;
}

export function createCertificateIssuedEvent(
  certificate: ComplianceCertificate,
): CertificateIssuedEvent {
  return Object.freeze({ type: "compliance.certificate.issued", certificate });
}

import { Identity } from "@server/security/identity/identity.base";

export interface ServiceIdentityProps {
  serviceId: string;
  serviceName: string;
}

/** Represents a trusted inter-service caller. */
export class ServiceIdentity extends Identity {
  readonly type = "service" as const;
  readonly serviceId: string;
  readonly serviceName: string;

  private constructor(props: ServiceIdentityProps) {
    super();
    this.serviceId = props.serviceId;
    this.serviceName = props.serviceName;
    Object.freeze(this);
  }

  static create(props: ServiceIdentityProps): ServiceIdentity {
    const serviceId = props.serviceId?.trim();
    const serviceName = props.serviceName?.trim();

    if (!serviceId || !serviceName) {
      throw new Error("ServiceIdentity requires serviceId and serviceName.");
    }

    return new ServiceIdentity({ serviceId, serviceName });
  }

  protected identityKey(): string {
    return `service:${this.serviceId}`;
  }
}

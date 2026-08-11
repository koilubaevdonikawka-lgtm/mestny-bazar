export class AttributeGroupNotFoundError extends Error {
  constructor() {
    super("Attribute group not found");
    this.name = "AttributeGroupNotFoundError";
  }
}

export class AttributeNotFoundError extends Error {
  constructor() {
    super("Attribute not found");
    this.name = "AttributeNotFoundError";
  }
}

export class AttributeValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "AttributeValidationError";
  }
}

/** The value payload does not match the attribute's declared valueType (e.g. a NUMBER given to a TEXT attribute). */
export class AttributeValueTypeMismatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttributeValueTypeMismatchError";
  }
}

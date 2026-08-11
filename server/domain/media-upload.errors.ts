export class MediaUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaUploadValidationError";
  }
}

export class MediaUploadProcessingError extends Error {
  constructor(message = "Failed to process the uploaded image") {
    super(message);
    this.name = "MediaUploadProcessingError";
  }
}

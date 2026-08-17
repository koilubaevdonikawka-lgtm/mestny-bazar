export class UserAdminNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserAdminNotFoundError";
  }
}

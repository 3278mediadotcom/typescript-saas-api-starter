/**
 * Standardized error class for the application.
 *
 * Thrown errors carry:
 * - A human-readable message
 * - An HTTP status code
 * - A machine-readable error code
 *
 * The global error handler middleware converts these
 * into consistent JSON error responses.
 */
export class AppError extends Error {
  /**
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code to return
   * @param code - Machine-readable error code (e.g. "UNAUTHORIZED")
   */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);

    this.name = "AppError";
  }
}
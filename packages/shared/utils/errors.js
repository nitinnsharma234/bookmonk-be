/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation error - 400 Bad Request
 * Use for invalid input data
 */
export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * Not Found error - 404
 * Use when a resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource = "Resource", identifier = "") {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    this.resource = resource;
  }
}

/**
 * Conflict error - 409
 * Use for duplicate entries or conflicting operations
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

/**
 * Unauthorized error - 401
 * Use when authentication is required but not provided
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Forbidden error - 403
 * Use when user doesn't have permission
 */
export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

/**
 * Service error - 503
 * Use for inter-service communication failures
 */
export class ServiceError extends AppError {
  constructor(serviceName, originalError = null) {
    super(`Service '${serviceName}' is unavailable`, 503, "SERVICE_UNAVAILABLE");
    this.serviceName = serviceName;
    this.originalError = originalError;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      serviceName: this.serviceName,
      originalMessage: this.originalError?.message,
    };
  }
}

/**
 * Bad Gateway error - 502
 * Use when upstream service returns invalid response
 */
export class BadGatewayError extends AppError {
  constructor(serviceName, message = "Invalid response from upstream service") {
    super(message, 502, "BAD_GATEWAY");
    this.serviceName = serviceName;
  }
}

/**
 * Rate Limit error - 429
 * Use when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export default {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ServiceError,
  BadGatewayError,
  RateLimitError,
};

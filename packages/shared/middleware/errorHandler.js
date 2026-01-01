import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

/**
 * Global error handling middleware
 * Handles all errors thrown in the application
 *
 * Features:
 * - Structured error logging with request context
 * - Different response formats for operational vs programming errors
 * - Stack traces only in development
 * - Consistent error response format
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let code = err.code || "INTERNAL_ERROR";
  let errors = err.errors || null;

  // Log error with context
  const logContext = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    userId: req.user?.id,
  };

  // Log operational errors as warnings, programming errors as errors
  if (err.isOperational || err instanceof AppError) {
    logger.warn(`[${code}] ${message}`, logContext);
  } else {
    // Programming or unknown errors - log full error
    logger.error(`Unhandled error: ${message}`, {
      ...logContext,
      stack: err.stack,
    });

    // Don't expose internal errors to client in production
    if (process.env.NODE_ENV === "production") {
      message = "An unexpected error occurred";
      code = "INTERNAL_ERROR";
    }
  }

  // Build response
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Add validation errors if present
  if (errors) {
    response.error.errors = errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.error.stack = err.stack;
  }

  // Add request ID for reference
  if (req.requestId) {
    response.error.requestId = req.requestId;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
